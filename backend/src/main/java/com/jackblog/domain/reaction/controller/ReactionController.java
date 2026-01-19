package com.jackblog.domain.reaction.controller;

import com.jackblog.common.response.ApiResponse;
import com.jackblog.domain.reaction.dto.ReactionRequest;
import com.jackblog.domain.reaction.dto.ReactionResponse;
import com.jackblog.domain.reaction.service.ReactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts/{slug}/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReactionResponse>> getReactions(
        @PathVariable String slug,
        @RequestParam(required = false) String clientId
    ) {
        ReactionResponse reactions = reactionService.getReactions(slug, clientId);
        return ResponseEntity.ok(ApiResponse.success(reactions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReactionResponse>> toggleReaction(
        @PathVariable String slug,
        @Valid @RequestBody ReactionRequest request
    ) {
        ReactionResponse reactions = reactionService.toggleReaction(
            slug,
            request.getEmoji(),
            request.getClientId()
        );
        return ResponseEntity.ok(ApiResponse.success(reactions));
    }

    @PostMapping("/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
        @PathVariable String slug,
        @RequestParam String clientId
    ) {
        boolean liked = reactionService.toggleLike(slug, clientId);
        long likeCount = reactionService.getLikeCount(slug);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "liked", liked,
            "likeCount", likeCount
        )));
    }

    @GetMapping("/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLikeStatus(
        @PathVariable String slug,
        @RequestParam String clientId
    ) {
        boolean liked = reactionService.hasLiked(slug, clientId);
        long likeCount = reactionService.getLikeCount(slug);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "liked", liked,
            "likeCount", likeCount
        )));
    }
}
