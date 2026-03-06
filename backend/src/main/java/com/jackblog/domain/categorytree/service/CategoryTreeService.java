package com.jackblog.domain.categorytree.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jackblog.common.exception.BadRequestException;
import com.jackblog.domain.categorytree.dto.CategoryTreePayload;
import com.jackblog.domain.categorytree.entity.CategoryTreeConfig;
import com.jackblog.domain.categorytree.repository.CategoryTreeConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryTreeService {

    private static final long CATEGORY_TREE_SINGLETON_ID = 1L;

    private final CategoryTreeConfigRepository categoryTreeConfigRepository;
    private final ObjectMapper objectMapper;

    public CategoryTreePayload getCategoryTree() {
        return categoryTreeConfigRepository.findById(CATEGORY_TREE_SINGLETON_ID)
            .map(config -> deserialize(config.getPayloadJson()))
            .orElseGet(() -> CategoryTreePayload.builder().build());
    }

    @Transactional
    public CategoryTreePayload updateCategoryTree(CategoryTreePayload payload) {
        validatePayload(payload);

        String serializedPayload = serialize(payload);

        CategoryTreeConfig config = categoryTreeConfigRepository
            .findById(CATEGORY_TREE_SINGLETON_ID)
            .orElseGet(() -> CategoryTreeConfig.builder()
                .id(CATEGORY_TREE_SINGLETON_ID)
                .payloadJson(serializedPayload)
                .build());

        config.updatePayloadJson(serializedPayload);
        categoryTreeConfigRepository.save(config);
        return payload;
    }

    private void validatePayload(CategoryTreePayload payload) {
        if (payload == null) {
            throw new BadRequestException("category tree payload is required");
        }
        if (payload.getNodes() == null || payload.getPostCategoryOverrides() == null) {
            throw new BadRequestException("nodes and postCategoryOverrides are required");
        }
    }

    private String serialize(CategoryTreePayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("failed to serialize category tree payload");
        }
    }

    private CategoryTreePayload deserialize(String payloadJson) {
        try {
            return objectMapper.readValue(payloadJson, CategoryTreePayload.class);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("failed to parse category tree payload");
        }
    }
}
