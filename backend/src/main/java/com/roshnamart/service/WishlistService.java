package com.roshnamart.service;

import com.roshnamart.dto.AddToCartRequest;
import com.roshnamart.dto.ProductResponse;
import com.roshnamart.entity.Buyer;
import com.roshnamart.entity.Product;
import com.roshnamart.entity.Wishlist;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.BuyerRepository;
import com.roshnamart.repository.ProductRepository;
import com.roshnamart.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public List<ProductResponse> getBuyerWishlist(Long buyerUserId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        return wishlistRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId()).stream()
                .map(w -> mapper.toProductResponse(w.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(Long buyerUserId, Long productId) {
        return buyerRepository.findByUserId(buyerUserId)
                .map(buyer -> wishlistRepository.existsByBuyerIdAndProductId(buyer.getId(), productId))
                .orElse(false);
    }

    @Transactional
    public void addToWishlist(Long buyerUserId, Long productId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!wishlistRepository.existsByBuyerIdAndProductId(buyer.getId(), productId)) {
            Wishlist wishlist = Wishlist.builder()
                    .buyer(buyer)
                    .product(product)
                    .build();
            wishlistRepository.save(wishlist);
        }
    }

    @Transactional
    public void removeFromWishlist(Long buyerUserId, Long productId) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        wishlistRepository.deleteByBuyerIdAndProductId(buyer.getId(), productId);
    }

    @Transactional
    public void moveToCart(Long buyerUserId, Long productId) {
        cartService.addToCart(buyerUserId, AddToCartRequest.builder()
                .productId(productId)
                .quantity(1)
                .build());
        removeFromWishlist(buyerUserId, productId);
    }
}
