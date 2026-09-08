package com.roshnamart.service;

import com.roshnamart.dto.CheckoutRequest;
import com.roshnamart.dto.CouponValidateResponse;
import com.roshnamart.dto.OrderResponse;
import com.roshnamart.dto.ReturnRequestDto;
import com.roshnamart.entity.*;
import com.roshnamart.exception.ForbiddenException;
import com.roshnamart.exception.InsufficientStockException;
import com.roshnamart.exception.InvalidOrderStateException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final BuyerRepository buyerRepository;
    private final SellerRepository sellerRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final MarketplaceSettingsRepository settingsRepository;
    private final NotificationService notificationService;
    private final CouponService couponService;
    private final EntityDtoMapper mapper;

    @Transactional(rollbackFor = Exception.class)
    public OrderResponse placeOrder(Long buyerUserId, CheckoutRequest request) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Address shippingAddress = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));

        if (!shippingAddress.getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to use this delivery address");
        }

        Cart cart = cartRepository.findByBuyerId(buyer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new InsufficientStockException("Your cart is empty. Please add items before checkout.");
        }

        MarketplaceSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElse(MarketplaceSettings.builder().build());

        // Validate stock for all items upfront
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new InsufficientStockException("Product '" + product.getName() + "' is no longer active for purchase.");
            }
            if (product.getQuantity() < item.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() + "'. Available: " + product.getQuantity() + ", requested: " + item.getQuantity());
            }
        }

        // Calculate Subtotals
        BigDecimal itemsTotal = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            itemsTotal = itemsTotal.add(item.getSubtotal());
        }

        // Check Minimum Order Amount
        if (settings.getMinOrderAmount() != null && itemsTotal.compareTo(settings.getMinOrderAmount()) < 0) {
            throw new IllegalArgumentException("Minimum order amount is ₹" + settings.getMinOrderAmount() + ". Current items total: ₹" + itemsTotal);
        }

        // Coupon Discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            CouponValidateResponse couponResponse = couponService.validateCoupon(request.getCouponCode().trim(), itemsTotal);
            if (couponResponse.isValid()) {
                discountAmount = couponResponse.getDiscountAmount();
                couponRepository.findByCode(request.getCouponCode().trim()).ifPresent(c -> {
                    c.setUsedCount(c.getUsedCount() + 1);
                    couponRepository.save(c);
                });
            }
        }

        // Delivery Charge
        BigDecimal deliveryCharge = settings.getDeliveryCharge() != null ? settings.getDeliveryCharge() : BigDecimal.ZERO;
        if (settings.getFreeDeliveryThreshold() != null && itemsTotal.compareTo(settings.getFreeDeliveryThreshold()) >= 0) {
            deliveryCharge = BigDecimal.ZERO;
        }

        BigDecimal finalAmount = itemsTotal.subtract(discountAmount).add(deliveryCharge);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        // Generate Order Number
        String orderNumber = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + (1000 + new Random().nextInt(9000));

        PaymentStatus initialPaymentStatus = request.getPaymentMethod() == PaymentMethod.ONLINE ?
                PaymentStatus.SUCCESS : PaymentStatus.PENDING;

        // Create Parent Order
        Order order = Order.builder()
                .buyer(buyer)
                .orderNumber(orderNumber)
                .totalAmount(itemsTotal)
                .discountAmount(discountAmount)
                .deliveryCharge(deliveryCharge)
                .finalAmount(finalAmount)
                .paymentStatus(initialPaymentStatus)
                .orderStatus(OrderStatus.PLACED)
                .shippingAddress(shippingAddress)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Process Multi-Seller Order Items & Atomically Deduct Stock
        List<OrderItem> orderItems = new ArrayList<>();
        Set<Seller> participatingSellers = new HashSet<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            Seller seller = cartItem.getSeller();
            participatingSellers.add(seller);

            // Deduct Stock atomically
            int remainingStock = product.getQuantity() - cartItem.getQuantity();
            product.setQuantity(remainingStock);
            if (remainingStock == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);

            // Commission & Seller Earnings calculation
            BigDecimal commissionPercentage = seller.getCommissionPercentage() != null ?
                    seller.getCommissionPercentage() : new BigDecimal("5.00");

            BigDecimal itemCommission = cartItem.getSubtotal()
                    .multiply(commissionPercentage)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            BigDecimal sellerEarning = cartItem.getSubtotal().subtract(itemCommission);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .seller(seller)
                    .productName(product.getName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getPrice())
                    .subtotal(cartItem.getSubtotal())
                    .commissionAmount(itemCommission)
                    .sellerEarning(sellerEarning)
                    .itemStatus(OrderItemStatus.PLACED)
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));

            // Update Seller totals
            seller.setTotalSales(seller.getTotalSales() + cartItem.getQuantity());
            seller.setTotalRevenue(seller.getTotalRevenue().add(cartItem.getSubtotal()));
            sellerRepository.save(seller);
        }

        savedOrder.setItems(orderItems);

        // Create Payment
        String txnId = request.getPaymentMethod() == PaymentMethod.ONLINE ?
                "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase() :
                "COD-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(request.getPaymentMethod())
                .transactionId(txnId)
                .amount(finalAmount)
                .paymentStatus(initialPaymentStatus)
                .paymentDate(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // Clear Cart
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();

        // Send Notifications
        notificationService.sendNotification(
                buyer.getUser(),
                "Order Placed Successfully",
                "Your order #" + orderNumber + " of ₹" + finalAmount + " has been placed successfully.",
                "ORDER_PLACED"
        );

        for (Seller seller : participatingSellers) {
            notificationService.sendNotification(
                    seller.getUser(),
                    "New Order Received",
                    "New order item received for order #" + orderNumber + ". Please review and fulfill.",
                    "NEW_ORDER"
            );
        }

        log.info("Order placed successfully with orderNumber: {}", orderNumber);
        return mapper.toOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getBuyerOrders(Long buyerUserId, int page, int size) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId(), pageable)
                .map(mapper::toOrderResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getBuyerOrderById(Long buyerUserId, Long orderId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to view this order");
        }

        return mapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long buyerUserId, Long orderId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to cancel this order");
        }

        if (order.getOrderStatus() != OrderStatus.PLACED && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Order cannot be cancelled in state: " + order.getOrderStatus() + ". Cancellation is only permitted for PLACED or CONFIRMED orders.");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.SUCCESS) {
            order.getPayment().setPaymentStatus(PaymentStatus.REFUNDED);
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            item.setItemStatus(OrderItemStatus.CANCELLED);
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.ACTIVE);
            }
            productRepository.save(product);
        }

        Order saved = orderRepository.save(order);

        notificationService.sendNotification(
                buyer.getUser(),
                "Order Cancelled",
                "Your order #" + order.getOrderNumber() + " has been cancelled.",
                "ORDER_CANCELLED"
        );

        return mapper.toOrderResponse(saved);
    }

    @Transactional
    public ReturnRequestDto requestReturn(Long buyerUserId, ReturnRequestDto request) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        OrderItem item = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + request.getOrderItemId()));

        if (!item.getOrder().getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to request return for this item");
        }

        if (item.getItemStatus() != OrderItemStatus.DELIVERED) {
            throw new InvalidOrderStateException("Return can only be requested for DELIVERED items. Current status: " + item.getItemStatus());
        }

        MarketplaceSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElse(MarketplaceSettings.builder().build());

        int returnWindow = settings.getReturnWindowDays() != null ? settings.getReturnWindowDays() : 7;
        if (item.getOrder().getCreatedAt().plusDays(returnWindow).isBefore(LocalDateTime.now())) {
            throw new InvalidOrderStateException("Return window of " + returnWindow + " days has expired for this order.");
        }

        item.setItemStatus(OrderItemStatus.RETURN_REQUESTED);
        orderItemRepository.save(item);

        ReturnRequest returnReq = ReturnRequest.builder()
                .orderItem(item)
                .buyer(buyer)
                .seller(item.getSeller())
                .reason(request.getReason())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(ReturnStatus.REQUESTED)
                .build();

        ReturnRequest saved = returnRequestRepository.save(returnReq);

        notificationService.sendNotification(
                buyer.getUser(),
                "Return Requested",
                "Your return request for " + item.getProductName() + " has been submitted.",
                "RETURN_REQUESTED"
        );

        return mapper.toReturnRequestDto(saved);
    }

    @Transactional
    public void buyAgain(Long buyerUserId, Long orderId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to access this order");
        }

        Cart cart = cartRepository.findByBuyerId(buyer.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().buyer(buyer).build()));

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null && product.getStatus() == ProductStatus.ACTIVE && product.getQuantity() > 0) {
                int addQty = Math.min(item.getQuantity(), product.getQuantity());
                BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();

                Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
                if (existing.isPresent()) {
                    CartItem ci = existing.get();
                    ci.setQuantity(Math.min(ci.getQuantity() + addQty, product.getQuantity()));
                    ci.setSubtotal(effectivePrice.multiply(BigDecimal.valueOf(ci.getQuantity())));
                    cartItemRepository.save(ci);
                } else {
                    CartItem ci = CartItem.builder()
                            .cart(cart)
                            .product(product)
                            .seller(product.getSeller())
                            .quantity(addQty)
                            .price(effectivePrice)
                            .subtotal(effectivePrice.multiply(BigDecimal.valueOf(addQty)))
                            .build();
                    cartItemRepository.save(ci);
                }
            }
        }
    }
}
