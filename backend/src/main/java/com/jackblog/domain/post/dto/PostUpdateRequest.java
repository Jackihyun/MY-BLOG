package com.jackblog.domain.post.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateRequest {

    @Size(max = 500, message = "Title must be less than 500 characters")
    private String title;

    @Size(max = 100000, message = "Content must be less than 100000 characters")
    private String content;

    @Size(max = 500, message = "Excerpt must be less than 500 characters")
    private String excerpt;

    @Size(max = 100, message = "Category must be less than 100 characters")
    private String category;

    private Boolean publish;
}
