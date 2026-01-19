package com.jackblog.domain.comment.dto;

import com.jackblog.domain.comment.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String authorName;
    private String content;
    private Integer depth;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private List<CommentResponse> replies;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
            .id(comment.getId())
            .authorName(comment.getAuthorName())
            .content(comment.getContent())
            .depth(comment.getDepth())
            .isDeleted(comment.getIsDeleted())
            .createdAt(comment.getCreatedAt())
            .replies(comment.getReplies() != null
                ? comment.getReplies().stream()
                    .map(CommentResponse::from)
                    .collect(Collectors.toList())
                : new ArrayList<>())
            .build();
    }

    public static List<CommentResponse> fromList(List<Comment> comments) {
        return comments.stream()
            .map(CommentResponse::from)
            .collect(Collectors.toList());
    }
}
