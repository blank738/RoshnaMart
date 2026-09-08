package com.roshnamart.service;

import com.roshnamart.dto.AddToCartRequest;
import com.roshnamart.dto.CartResponse;
import com.roshnamart.dto.UpdateCartItemRequest;
import com.roshnamart.entity.*;
import com.roshnamart.exception.ForbiddenException;
import com.roshnamart.exception.InsufficientStockException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;
    private final EntityDtoMapper mapper;

    private Cart getOrCreateCart(Buyer buyer) {
        return cartRepository.findByBuyerId(buyer.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().buyer(buyer).build()));
    }

    @Transactional
    public CartResponse getBuyerCart(Long buyerUserId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
        Cart cart = getOrCreateCart(buyer);
        return mapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long buyerUserId, AddToCartRequest request) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new InsufficientStockException("This product is currently unavailable");
        }

        if (product.getQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + product.getQuantity() + ")");
        }

        Cart cart = getOrCreateCart(buyer);

        BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (product.getQuantity() < newQuantity) {
                throw new InsufficientStockException("Total cart quantity (" + newQuantity + ") exceeds available stock (" + product.getQuantity() + ")");
            }
            item.setQuantity(newQuantity);
            item.setPrice(effectivePrice);
            item.setSubtotal(effectivePrice.multiply(BigDecimal.valueOf(newQuantity)));
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .seller(product.getSeller())
                    .quantity(request.getQuantity())
                    .price(effectivePrice)
                    .subtotal(effectivePrice.multiply(BigDecimal.valueOf(request.getQuantity())))
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        return mapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItem(Long buyerUserId, Long cartItemId, UpdateCartItemRequest request) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to modify this cart item");
        }

        Product product = item.getProduct();
        if (product.getQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + product.getQuantity() + ")");
        }

        BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
        item.setQuantity(request.getQuantity());
        item.setPrice(effectivePrice);
        item.setSubtotal(effectivePrice.multiply(BigDecimal.valueOf(request.getQuantity())));
        cartItemRepository.save(item);

        return mapper.toCartResponse(item.getCart());
    }

    @Transactional
    public CartResponse removeFromCart(Long buyerUserId, Long cartItemId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getBuyer().getId().equals(buyer.getId())) {
            throw new ForbiddenException("Unauthorized to modify this cart item");
        }

        Cart cart = item.getCart();
        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return mapper.toCartResponse(cart);
    }

    @Transactional
    public void clearCart(Long buyerUserId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        cartRepository.findByBuyerId(buyer.getId()).ifPresent(cart -> {
            cartItemRepository.deleteByCartId(cart.getId());
            cart.getItems().clear();
        });
    }
}
