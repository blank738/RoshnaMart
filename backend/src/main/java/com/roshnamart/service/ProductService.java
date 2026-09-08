package com.roshnamart.service;

import com.roshnamart.dto.ProductCreateUpdateRequest;
import com.roshnamart.dto.ProductResponse;
import com.roshnamart.dto.SellerProductDetailResponse;
import com.roshnamart.entity.*;
import com.roshnamart.exception.ForbiddenException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final MarketplaceSettingsRepository settingsRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getPublicProducts(
            String search, Long categoryId, Long sellerId,
            BigDecimal minPrice, BigDecimal maxPrice, Double minRating,
            String sortBy, int page, int size
    ) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("priceAsc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("priceDesc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "rating");
        } else if ("popular".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "reviewCount");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.filterPublicProducts(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                categoryId, sellerId, minPrice, maxPrice, minRating, pageable
        );

        return products.map(mapper::toProductResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapper.toProductResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findTop8ByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE)
                .stream().map(mapper::toProductResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getDiscountedProducts() {
        return productRepository.findTop8ByStatusAndDiscountPriceIsNotNullOrderByDiscountPriceAsc(ProductStatus.ACTIVE)
                .stream().map(mapper::toProductResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(Long sellerUserId, ProductCreateUpdateRequest request) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        if (seller.getVerificationStatus() != SellerVerificationStatus.APPROVED) {
            throw new ForbiddenException("Your seller account is " + seller.getVerificationStatus() + ". Only approved sellers can list products.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        MarketplaceSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElse(MarketplaceSettings.builder().build());

        ProductStatus initialStatus = Boolean.TRUE.equals(settings.getProductApprovalRequired()) ?
                ProductStatus.PENDING_APPROVAL : ProductStatus.ACTIVE;

        if (request.getQuantity() == 0) {
            initialStatus = ProductStatus.OUT_OF_STOCK;
        }

        String sku = request.getSku() != null && !request.getSku().trim().isEmpty() ?
                request.getSku().trim() : "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Product product = Product.builder()
                .seller(seller)
                .category(category)
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .quantity(request.getQuantity())
                .imageUrl(request.getImageUrl())
                .brand(request.getBrand())
                .sku(sku)
                .status(initialStatus)
                .build();

        if (request.getAdditionalImages() != null && !request.getAdditionalImages().isEmpty()) {
            int order = 0;
            for (String imgUrl : request.getAdditionalImages()) {
                ProductImage img = ProductImage.builder()
                        .product(product)
                        .imageUrl(imgUrl)
                        .displayOrder(order++)
                        .build();
                product.getImages().add(img);
            }
        }

        Product savedProduct = productRepository.save(product);
        return mapper.toProductResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long sellerUserId, Long productId, ProductCreateUpdateRequest request) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ForbiddenException("You are not authorized to update another seller's product");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setQuantity(request.getQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setBrand(request.getBrand());

        if (request.getQuantity() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK && request.getQuantity() > 0) {
            product.setStatus(ProductStatus.ACTIVE);
        }

        if (request.getStatus() != null) {
            try {
                product.setStatus(ProductStatus.valueOf(request.getStatus()));
            } catch (IllegalArgumentException ignored) {}
        }

        Product updatedProduct = productRepository.save(product);
        return mapper.toProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long sellerUserId, Long productId) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ForbiddenException("You are not authorized to delete another seller's product");
        }

        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse updateStock(Long sellerUserId, Long productId, Integer quantity) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ForbiddenException("You are not authorized to update this product's stock");
        }

        product.setQuantity(quantity);
        if (quantity == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK && quantity > 0) {
            product.setStatus(ProductStatus.ACTIVE);
        }

        Product saved = productRepository.save(product);
        return mapper.toProductResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getSellerProducts(Long sellerUserId, int page, int size) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findBySellerId(seller.getId(), pageable).map(mapper::toProductResponse);
    }

    @Transactional(readOnly = true)
    public SellerProductDetailResponse getSellerProductDetails(Long sellerUserId, Long productId) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ForbiddenException("Unauthorized to view this product details");
        }

        long totalOrders = orderItemRepository.countOrdersByProductId(productId);
        long buyerCount = orderItemRepository.countBuyersByProductId(productId);
        BigDecimal gross = orderItemRepository.calculateGrossRevenueByProductId(productId);
        BigDecimal commission = orderItemRepository.calculateCommissionByProductId(productId);
        BigDecimal net = orderItemRepository.calculateNetRevenueByProductId(productId);
        var reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(mapper::toReviewDto).collect(Collectors.toList());

        return SellerProductDetailResponse.builder()
                .product(mapper.toProductResponse(product))
                .totalOrders(totalOrders)
                .buyerCount(buyerCount)
                .grossRevenue(gross)
                .commission(commission)
                .netRevenue(net)
                .reviews(reviews)
                .build();
    }
}
