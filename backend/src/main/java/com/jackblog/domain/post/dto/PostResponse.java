package com.jackblog.domain.post.dto;

import com.jackblog.domain.post.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String slug;
    private String title;
    private String excerpt;
    private String category;
    private Integer readingTime;
    private Integer viewCount;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    private static String buildExcerpt(Post post) {
        if (StringUtils.hasText(post.getExcerpt())) {
            return post.getExcerpt().trim();
        }

        if (!StringUtils.hasText(post.getContent())) {
            return "";
        }

        String plainText = post.getContent()
            .replaceAll("```[\\s\\S]*?```", " ")
            .replaceAll("`[^`]*`", " ")
            .replaceAll("!\\[[^\\]]*\\]\\([^)]*\\)", " ")
            .replaceAll("\\[[^\\]]*\\]\\([^)]*\\)", " ")
            .replaceAll("[#>*_~\\-]", " ")
            .replaceAll("\\s+", " ")
            .trim();

        if (plainText.length() <= 180) {
            return plainText;
        }

        return plainText.substring(0, 177) + "...";
    }

    public static PostResponse from(Post post) {
        return PostResponse.builder()
            .id(post.getId())
            .slug(post.getSlug())
            .title(post.getTitle())
            .excerpt(buildExcerpt(post))
            .category(post.getCategory())
            .readingTime(post.getReadingTime())
            .viewCount(post.getViewCount())
            .isPublished(post.getIsPublished())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .publishedAt(post.getPublishedAt())
            .build();
    }
}
