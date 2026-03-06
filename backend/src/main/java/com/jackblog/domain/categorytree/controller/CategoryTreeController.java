package com.jackblog.domain.categorytree.controller;

import com.jackblog.common.response.ApiResponse;
import com.jackblog.domain.categorytree.dto.CategoryTreePayload;
import com.jackblog.domain.categorytree.service.CategoryTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/category-tree")
@RequiredArgsConstructor
public class CategoryTreeController {

    private final CategoryTreeService categoryTreeService;

    @GetMapping
    public ResponseEntity<ApiResponse<CategoryTreePayload>> getCategoryTree() {
        return ResponseEntity.ok(ApiResponse.success(categoryTreeService.getCategoryTree()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<CategoryTreePayload>> updateCategoryTree(
        @RequestBody CategoryTreePayload payload
    ) {
        return ResponseEntity.ok(ApiResponse.success(categoryTreeService.updateCategoryTree(payload)));
    }
}
