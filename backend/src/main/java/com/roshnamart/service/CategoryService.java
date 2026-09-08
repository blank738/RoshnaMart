package com.roshnamart.service;

import com.roshnamart.dto.CategoryRequest;
import com.roshnamart.dto.CategoryResponse;
import com.roshnamart.entity.Category;
import com.roshnamart.exception.DuplicateResourceException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(mapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatus("ACTIVE").stream()
                .map(mapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapper.toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        categoryRepository.findByName(request.getName()).ifPresent(c -> {
            throw new DuplicateResourceException("Category already exists: " + request.getName());
        });

        Category category = Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .image(request.getImage())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Category saved = categoryRepository.save(category);
        return mapper.toCategoryResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setImage(request.getImage());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        Category updated = categoryRepository.save(category);
        return mapper.toCategoryResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setStatus("INACTIVE");
        categoryRepository.save(category);
    }
}
