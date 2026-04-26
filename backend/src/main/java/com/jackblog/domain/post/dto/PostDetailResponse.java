package com.jackblog.domain.post.dto;

import com.jackblog.domain.post.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

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
    private String thumbnail;
    private String category;
    private List<String> categories;
    private Integer readingTime;
    private Integer viewCount;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private long commentCount;
    private long likeCount;

    private static String resolveThumbnail(Post post) {
        if (StringUtils.hasText(post.getThumbnail())) {
            return post.getThumbnail().trim();
        }

        if (!StringUtils.hasText(post.getContentHtml())) {
            return null;
        }

        java.util.regex.Matcher matcher = java.util.regex.Pattern
            .compile("<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>", java.util.regex.Pattern.CASE_INSENSITIVE)
            .matcher(post.getContentHtml());

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }

    private static List<String> resolveCategories(Post post) {
        if (post.getCategories() != null && !post.getCategories().isEmpty()) {
            return List.copyOf(post.getCategories());
        }

        if (StringUtils.hasText(post.getCategory())) {
            return List.of(post.getCategory().trim());
        }

        return List.of();
    }

    public static PostDetailResponse from(Post post, long commentCount, long likeCount) {
        List<String> categories = resolveCategories(post);
        return PostDetailResponse.builder()
            .id(post.getId())
            .slug(post.getSlug())
            .title(post.getTitle())
            .content(post.getContent())
            .contentHtml(post.getContentHtml())
            .excerpt(post.getExcerpt())
            .thumbnail(resolveThumbnail(post))
            .category(categories.isEmpty() ? post.getCategory() : categories.get(0))
            .categories(categories)
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
