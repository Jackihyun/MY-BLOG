package com.jackblog.domain.categorytree.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryNodeDto {
    private String id;
    private String name;
    private String parentId;
    private Integer order;
}
