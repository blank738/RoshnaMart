package com.roshnamart.service;

import com.roshnamart.dto.ReviewDto;
import com.roshnamart.entity.Buyer;
import com.roshnamart.entity.Product;
import com.roshnamart.entity.Review;
import com.roshnamart.exception.ForbiddenException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.BuyerRepository;
import com.roshnamart.repository.OrderItemRepository;
import com.roshnamart.repository.ProductRepository;
import com.roshnamart.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final BuyerRepository buyerRepository;
    private final OrderItemRepository orderItemRepository;
    private final EntityDtoMapper mapper;

    @Transactional
    public ReviewDto addReview(Long buyerUserId, ReviewDto dto) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        // Check if buyer has purchased this product
        boolean hasPurchased = orderItemRepository.existsByProductIdAndOrderBuyerId(product.getId(), buyer.getId());
        if (!hasPurchased) {
            throw new ForbiddenException("Only buyers who have purchased this product can submit a review.");
        }

        if (reviewRepository.existsByProductIdAndBuyerId(product.getId(), buyer.getId())) {
            throw new IllegalArgumentException("You have already reviewed this product.");
        }

        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }

        Review review = Review.builder()
                .buyer(buyer)
                .product(product)
                .rating(dto.getRating())
                .title(dto.getTitle())
                .comment(dto.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        // Recalculate average rating & review count for product
        List<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(allReviews.size());
        productRepository.save(product);

        return mapper.toReviewDto(saved);
    }

    @Transactional(readOnly = true)
    public boolean isEligibleToReview(Long buyerUserId, Long productId) {
        return buyerRepository.findByUserId(buyerUserId)
                .map(buyer -> orderItemRepository.existsByProductIdAndOrderBuyerId(productId, buyer.getId())
                        && !reviewRepository.existsByProductIdAndBuyerId(productId, buyer.getId()))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(mapper::toReviewDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getProductReviewsPaged(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(mapper::toReviewDto);
    }
}
