package com.jackblog.domain.comment.controller;

import com.jackblog.common.response.ApiResponse;
import com.jackblog.domain.comment.dto.CommentCreateRequest;
import com.jackblog.domain.comment.dto.CommentDeleteRequest;
import com.jackblog.domain.comment.dto.CommentResponse;
import com.jackblog.domain.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{slug}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
        @PathVariable String slug
    ) {
        List<CommentResponse> comments = commentService.getComments(slug);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PostMapping("/posts/{slug}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
        @PathVariable String slug,
        @Valid @RequestBody CommentCreateRequest request
    ) {
        CommentResponse comment = commentService.createComment(slug, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Comment created", comment));
    }

    @PostMapping("/comments/{id}/reply")
    public ResponseEntity<ApiResponse<CommentResponse>> createReply(
        @PathVariable Long id,
        @Valid @RequestBody CommentCreateRequest request
    ) {
        CommentResponse reply = commentService.createReply(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Reply created", reply));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
        @PathVariable Long id,
        @Valid @RequestBody CommentDeleteRequest request
    ) {
        commentService.deleteComment(id, request.getPassword(), request.getRequesterEmail());
        return ResponseEntity.ok(ApiResponse.success("Comment deleted"));
    }

    @DeleteMapping("/comments/{id}/admin")
    public ResponseEntity<ApiResponse<Void>> deleteCommentAdmin(@PathVariable Long id) {
        commentService.deleteCommentAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted by admin"));
    }
}
