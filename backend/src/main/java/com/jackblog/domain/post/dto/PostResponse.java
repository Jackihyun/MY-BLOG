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
    private String thumbnail;
    private String category;
    private Integer readingTime;
    private Integer viewCount;
    private Long commentCount;
    private Long likeCount;
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

    public static PostResponse from(Post post) {
        return from(post, 0L, 0L);
    }

    public static PostResponse from(Post post, long commentCount, long likeCount) {
        return PostResponse.builder()
            .id(post.getId())
            .slug(post.getSlug())
            .title(post.getTitle())
            .excerpt(buildExcerpt(post))
            .thumbnail(resolveThumbnail(post))
            .category(post.getCategory())
            .readingTime(post.getReadingTime())
            .viewCount(post.getViewCount())
            .commentCount(commentCount)
            .likeCount(likeCount)
            .isPublished(post.getIsPublished())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .publishedAt(post.getPublishedAt())
            .build();
    }
}
