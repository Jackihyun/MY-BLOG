package com.jackblog.domain.post.controller;

import com.jackblog.common.response.ApiResponse;
import com.jackblog.common.response.PageResponse;
import com.jackblog.domain.post.dto.*;
import com.jackblog.domain.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> getPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String category
    ) {
        Page<PostResponse> posts = postService.getPosts(page, size, category);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(posts)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> getAllPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Page<PostResponse> posts = postService.getAllPosts(page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(posts)));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PostDetailResponse>> getPost(@PathVariable String slug) {
        PostDetailResponse post = postService.getPost(slug);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @GetMapping("/{slug}/admin")
    public ResponseEntity<ApiResponse<PostDetailResponse>> getPostAdmin(@PathVariable String slug) {
        PostDetailResponse post = postService.getPostAdmin(slug);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @PostMapping("/{slug}/view")
    public ResponseEntity<ApiResponse<Void>> incrementViewCount(@PathVariable String slug) {
        postService.incrementViewCount(slug);
        return ResponseEntity.ok(ApiResponse.success("View count incremented"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
        @Valid @RequestBody PostCreateRequest request
    ) {
        PostResponse post = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Post created", post));
    }

    @PutMapping("/{slug}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
        @PathVariable String slug,
        @Valid @RequestBody PostUpdateRequest request
    ) {
        PostResponse post = postService.updatePost(slug, request);
        return ResponseEntity.ok(ApiResponse.success("Post updated", post));
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable String slug) {
        postService.deletePost(slug);
        return ResponseEntity.ok(ApiResponse.success("Post deleted"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PostResponse>>> searchPosts(
        @RequestParam String q
    ) {
        List<PostResponse> posts = postService.searchPosts(q);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = postService.getCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPopularPosts(
        @RequestParam(defaultValue = "5") int limit
    ) {
        List<PostResponse> posts = postService.getPopularPosts(limit);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }
}
