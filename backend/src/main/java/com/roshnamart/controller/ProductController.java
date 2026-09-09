package com.roshnamart.controller;

import com.roshnamart.dto.ProductResponse;
import com.roshnamart.dto.ReviewDto;
import com.roshnamart.service.ProductService;
import com.roshnamart.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Public catalog, search, filter, and details endpoints")
public class ProductController {

    private final ProductService productService;
    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Search, filter, and paginate public products")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Page<ProductResponse> products = productService.getPublicProducts(
                search, categoryId, sellerId, minPrice, maxPrice, minRating, sortBy, page, size
        );
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get top featured products")
    public ResponseEntity<List<ProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/discounted")
    @Operation(summary = "Get special discounted offer products")
    public ResponseEntity<List<ProductResponse>> getDiscountedProducts() {
        return ResponseEntity.ok(productService.getDiscountedProducts());
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get customer reviews for a product")
    public ResponseEntity<List<ReviewDto>> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getProductReviews(id));
    }
}
