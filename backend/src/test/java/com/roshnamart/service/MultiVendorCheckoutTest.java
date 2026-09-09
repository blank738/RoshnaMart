package com.roshnamart.service;

import com.roshnamart.dto.CheckoutRequest;
import com.roshnamart.dto.CouponValidateResponse;
import com.roshnamart.dto.OrderResponse;
import com.roshnamart.entity.*;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MultiVendorCheckoutTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private BuyerRepository buyerRepository;
    @Mock
    private SellerRepository sellerRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private MarketplaceSettingsRepository settingsRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private CouponService couponService;
    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private OrderService orderService;

    private Buyer buyer;
    private Address address;
    private Seller sellerA;
    private Seller sellerB;
    private Product productA;
    private Product productB;
    private Cart cart;
    private CartItem itemA;
    private CartItem itemB;

    @BeforeEach
    void setUp() {
        User buyerUser = User.builder().id(1L).email("buyer@roshnamart.com").name("Buyer One").build();
        buyer = Buyer.builder().id(10L).user(buyerUser).build();

        address = Address.builder().id(100L).buyer(buyer).fullName("Buyer One").addressLine("Street 1").city("Bangalore").build();

        User sellerUserA = User.builder().id(2L).email("sellerA@roshnamart.com").name("Seller A").build();
        sellerA = Seller.builder().id(20L).user(sellerUserA).businessName("Electronics A").commissionPercentage(new BigDecimal("5.00")).totalSales(0).totalRevenue(BigDecimal.ZERO).build();

        User sellerUserB = User.builder().id(3L).email("sellerB@roshnamart.com").name("Seller B").build();
        sellerB = Seller.builder().id(30L).user(sellerUserB).businessName("Fashion B").commissionPercentage(new BigDecimal("5.00")).totalSales(0).totalRevenue(BigDecimal.ZERO).build();

        productA = Product.builder().id(200L).seller(sellerA).name("Headphones").price(new BigDecimal("500.00")).quantity(10).status(ProductStatus.ACTIVE).build();
        productB = Product.builder().id(300L).seller(sellerB).name("Jacket").price(new BigDecimal("1000.00")).quantity(5).status(ProductStatus.ACTIVE).build();

        cart = Cart.builder().id(1L).buyer(buyer).items(new ArrayList<>()).build();

        itemA = CartItem.builder().id(11L).cart(cart).product(productA).seller(sellerA).quantity(2).price(new BigDecimal("500.00")).subtotal(new BigDecimal("1000.00")).build();
        itemB = CartItem.builder().id(12L).cart(cart).product(productB).seller(sellerB).quantity(1).price(new BigDecimal("1000.00")).subtotal(new BigDecimal("1000.00")).build();

        cart.getItems().add(itemA);
        cart.getItems().add(itemB);
    }

    @Test
    @DisplayName("Multi-Vendor Checkout: Calculates independent seller commissions, deductions, and creates order")
    void testMultiVendorCheckout() {
        when(buyerRepository.findByUserId(1L)).thenReturn(Optional.of(buyer));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        when(cartRepository.findByBuyerId(10L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartId(1L)).thenReturn(List.of(itemA, itemB));

        MarketplaceSettings settings = MarketplaceSettings.builder()
                .minOrderAmount(new BigDecimal("100.00"))
                .deliveryCharge(new BigDecimal("50.00"))
                .freeDeliveryThreshold(new BigDecimal("500.00"))
                .build();
        when(settingsRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(settings));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(999L);
            return o;
        });

        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(mapper.toOrderResponse(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            return OrderResponse.builder()
                    .id(o.getId())
                    .orderNumber(o.getOrderNumber())
                    .totalAmount(o.getTotalAmount())
                    .discountAmount(o.getDiscountAmount())
                    .deliveryCharge(o.getDeliveryCharge())
                    .finalAmount(o.getFinalAmount())
                    .orderStatus(o.getOrderStatus().name())
                    .paymentStatus(o.getPaymentStatus().name())
                    .build();
        });

        CheckoutRequest request = CheckoutRequest.builder()
                .addressId(100L)
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        OrderResponse response = orderService.placeOrder(1L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("2000.00"), response.getTotalAmount());
        assertEquals(BigDecimal.ZERO, response.getDeliveryCharge()); // Free shipping threshold >= 500
        assertEquals(new BigDecimal("2000.00"), response.getFinalAmount());
        assertEquals("PLACED", response.getOrderStatus());
        assertEquals("SUCCESS", response.getPaymentStatus());

        // Verify stock was reduced
        assertEquals(8, productA.getQuantity()); // 10 - 2 = 8
        assertEquals(4, productB.getQuantity()); // 5 - 1 = 4
        verify(productRepository).save(productA);
        verify(productRepository).save(productB);

        // Verify cart was cleared
        verify(cartItemRepository).deleteByCartId(1L);

        // Verify commission on seller order items
        verify(orderItemRepository, times(2)).save(argThat(oi -> {
            if (oi.getSeller().getId().equals(20L)) {
                assertEquals(new BigDecimal("50.00"), oi.getCommissionAmount()); // 5% of 1000 = 50
                assertEquals(new BigDecimal("950.00"), oi.getSellerEarning());  // 1000 - 50 = 950
            } else if (oi.getSeller().getId().equals(30L)) {
                assertEquals(new BigDecimal("50.00"), oi.getCommissionAmount()); // 5% of 1000 = 50
                assertEquals(new BigDecimal("950.00"), oi.getSellerEarning());  // 1000 - 50 = 950
            }
            return true;
        }));
    }
}
