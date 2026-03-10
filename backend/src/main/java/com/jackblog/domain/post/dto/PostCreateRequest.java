package com.jackblog.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostCreateRequest {

    @Size(max = 255)
    private String slug;

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must be less than 500 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 100000, message = "Content must be less than 100000 characters")
    private String content;

    @Size(max = 500, message = "Excerpt must be less than 500 characters")
    private String excerpt;

    @Size(max = 1000, message = "Thumbnail URL must be less than 1000 characters")
    private String thumbnail;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must be less than 100 characters")
    private String category;

    private Boolean publish;

    @Size(max = 50, message = "Published date format is too long")
    private String publishedAt;
}
