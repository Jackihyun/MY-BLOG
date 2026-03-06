package com.jackblog.domain.categorytree.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTreePayload {
    @Builder.Default
    private List<CategoryNodeDto> nodes = List.of();

    @Builder.Default
    private Map<String, String> postCategoryOverrides = new HashMap<>();
}
