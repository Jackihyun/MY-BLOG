package com.jackblog.domain.post.dto;

import com.jackblog.domain.post.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDetailResponse {
    private Long id;
    private String slug;
    private String title;
    private String content;
    private String contentHtml;
    private String excerpt;
    private String category;
    private Integer readingTime;
    private Integer viewCount;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private long commentCount;
    private long likeCount;

    public static PostDetailResponse from(Post post, long commentCount, long likeCount) {
        return PostDetailResponse.builder()
            .id(post.getId())
            .slug(post.getSlug())
            .title(post.getTitle())
            .content(post.getContent())
            .contentHtml(post.getContentHtml())
            .excerpt(post.getExcerpt())
            .category(post.getCategory())
            .readingTime(post.getReadingTime())
            .viewCount(post.getViewCount())
            .isPublished(post.getIsPublished())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .publishedAt(post.getPublishedAt())
            .commentCount(commentCount)
            .likeCount(likeCount)
            .build();
    }
}
