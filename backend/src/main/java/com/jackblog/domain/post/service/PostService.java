package com.jackblog.domain.post.service;

import com.jackblog.common.exception.BadRequestException;
import com.jackblog.common.exception.ResourceNotFoundException;
import com.jackblog.domain.comment.repository.CommentRepository;
import com.jackblog.domain.post.dto.*;
import com.jackblog.domain.post.entity.Post;
import com.jackblog.domain.post.repository.PostRepository;
import com.jackblog.domain.reaction.repository.PostLikeRepository;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern SEARCHABLE_CHARACTER = Pattern.compile("[\\p{L}\\p{N}]");

    public Page<PostResponse> getPosts(int page, int size, String category) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Post> posts;
        if (StringUtils.hasText(category)) {
            posts = postRepository.findByIsPublishedTrueAndCategoryOrderByPublishedAtDesc(category, pageable);
        } else {
            posts = postRepository.findByIsPublishedTrueOrderByPublishedAtDesc(pageable);
        }

        return posts.map(PostResponse::from);
    }

    public Page<PostResponse> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findAllOrderByCreatedAtDesc(pageable).map(PostResponse::from);
    }

    public PostDetailResponse getPost(String slug) {
        Post post = postRepository.findBySlugAndIsPublishedTrue(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));

        long commentCount = commentRepository.countActiveCommentsByPostId(post.getId());
        long likeCount = postLikeRepository.countByPostId(post.getId());

        return PostDetailResponse.from(post, commentCount, likeCount);
    }

    public PostDetailResponse getPostAdmin(String slug) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));

        long commentCount = commentRepository.countActiveCommentsByPostId(post.getId());
        long likeCount = postLikeRepository.countByPostId(post.getId());

        return PostDetailResponse.from(post, commentCount, likeCount);
    }

    @Transactional
    public void incrementViewCount(String slug) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));
        post.incrementViewCount();
    }

    @Transactional
    public PostResponse createPost(PostCreateRequest request) {
        String normalizedRequestedSlug = StringUtils.hasText(request.getSlug())
            ? normalizeSlug(request.getSlug())
            : "";
        String slug = StringUtils.hasText(normalizedRequestedSlug)
            ? normalizedRequestedSlug
            : generateSlug(request.getTitle());

        if (postRepository.existsBySlug(slug)) {
            throw new BadRequestException("Slug already exists: " + slug);
        }

        String contentHtml = convertMarkdownToHtml(request.getContent());
        int readingTime = calculateReadingTime(request.getContent());
        String excerpt = StringUtils.hasText(request.getExcerpt())
            ? request.getExcerpt()
            : generateExcerpt(request.getContent());
        String thumbnail = resolveThumbnail(request.getThumbnail(), contentHtml);

        Post post = Post.builder()
            .slug(slug)
            .title(request.getTitle())
            .content(request.getContent())
            .contentHtml(contentHtml)
            .excerpt(excerpt)
            .thumbnail(thumbnail)
            .category(request.getCategory())
            .readingTime(readingTime)
            .build();

        if (Boolean.TRUE.equals(request.getPublish())) {
            post.publish();
        }

        resolvePublishedAt(request.getPublishedAt()).ifPresent(post::setPublishedAt);

        Post savedPost = postRepository.save(post);
        return PostResponse.from(savedPost);
    }

    @Transactional
    public PostResponse updatePost(String slug, PostUpdateRequest request) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));

        String title = StringUtils.hasText(request.getTitle()) ? request.getTitle() : post.getTitle();
        String content = StringUtils.hasText(request.getContent()) ? request.getContent() : post.getContent();
        String contentHtml = StringUtils.hasText(request.getContent())
            ? convertMarkdownToHtml(request.getContent())
            : post.getContentHtml();
        String excerpt = StringUtils.hasText(request.getExcerpt())
            ? request.getExcerpt()
            : (StringUtils.hasText(request.getContent()) ? generateExcerpt(request.getContent()) : post.getExcerpt());
        String thumbnail = request.getThumbnail() != null
            ? resolveThumbnail(request.getThumbnail(), contentHtml)
            : resolveThumbnail(post.getThumbnail(), contentHtml);
        String category = StringUtils.hasText(request.getCategory()) ? request.getCategory() : post.getCategory();
        int readingTime = StringUtils.hasText(request.getContent())
            ? calculateReadingTime(request.getContent())
            : post.getReadingTime();

        post.updateContent(title, content, contentHtml, excerpt, thumbnail, category, readingTime);

        if (request.getPublish() != null) {
            if (request.getPublish()) {
                post.publish();
            } else {
                post.unpublish();
            }
        }

        resolvePublishedAt(request.getPublishedAt()).ifPresent(post::setPublishedAt);

        return PostResponse.from(post);
    }

    @Transactional
    public void deletePost(String slug) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));
        postRepository.delete(post);
    }

    public List<PostResponse> searchPosts(String query) {
        String normalizedQuery = normalizeSearchQuery(query);

        if (!StringUtils.hasText(normalizedQuery) || normalizedQuery.length() < 2) {
            throw new BadRequestException("Search query must be at least 2 characters");
        }

        if (!SEARCHABLE_CHARACTER.matcher(normalizedQuery).find()) {
            return List.of();
        }

        List<Post> posts = postRepository.searchPosts(escapeLikeWildcards(normalizedQuery));

        return posts.stream()
            .map(PostResponse::from)
            .collect(Collectors.toList());
    }

    private String normalizeSearchQuery(String query) {
        if (query == null) {
            return "";
        }

        return MULTIPLE_WHITESPACE.matcher(query.trim()).replaceAll(" ");
    }

    private String escapeLikeWildcards(String query) {
        return query
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");
    }

    public List<String> getCategories() {
        return postRepository.findAllCategories();
    }

    public List<PostResponse> getPopularPosts(int limit) {
        return postRepository.findPopularPosts(PageRequest.of(0, limit))
            .stream()
            .map(PostResponse::from)
            .collect(Collectors.toList());
    }

    private String generateSlug(String title) {
        String slug = normalizeSlug(title);

        if (slug.isEmpty()) {
            slug = "post-" + System.currentTimeMillis();
        }

        return slug;
    }

    private String normalizeSlug(String value) {
        String nowhitespace = WHITESPACE.matcher(value.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = slug.toLowerCase(Locale.ENGLISH);
        slug = slug.replaceAll("-+", "-");
        slug = slug.replaceAll("^-|-$", "");
        return slug;
    }

    private String convertMarkdownToHtml(String markdown) {
        Parser parser = Parser.builder().build();
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        Node document = parser.parse(markdown);
        return renderer.render(document);
    }

    private int calculateReadingTime(String content) {
        int wordCount = content.split("\\s+").length;
        int koreanCharCount = content.replaceAll("[^\\uAC00-\\uD7A3]", "").length();
        int totalCount = wordCount + koreanCharCount / 2;
        return Math.max(1, totalCount / 200);
    }

    private String generateExcerpt(String content) {
        String plainText = content.replaceAll("[#*`\\[\\]()>-]", "").trim();
        if (plainText.length() <= 200) {
            return plainText;
        }
        return plainText.substring(0, 197) + "...";
    }

    private String resolveThumbnail(String requestedThumbnail, String contentHtml) {
        if (StringUtils.hasText(requestedThumbnail)) {
            return requestedThumbnail.trim();
        }

        if (!StringUtils.hasText(contentHtml)) {
            return null;
        }

        java.util.regex.Matcher matcher = java.util.regex.Pattern
            .compile("<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>", java.util.regex.Pattern.CASE_INSENSITIVE)
            .matcher(contentHtml);

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }

    private java.util.Optional<LocalDateTime> resolvePublishedAt(String value) {
        if (!StringUtils.hasText(value)) {
            return java.util.Optional.empty();
        }

        try {
            return java.util.Optional.of(LocalDateTime.parse(value));
        } catch (DateTimeParseException ignored) {
        }

        try {
            return java.util.Optional.of(OffsetDateTime.parse(value).toLocalDateTime());
        } catch (DateTimeParseException ignored) {
        }

        try {
            return java.util.Optional.of(LocalDate.parse(value).atTime(9, 0));
        } catch (DateTimeParseException ignored) {
        }

        throw new BadRequestException("Invalid publishedAt format. Use YYYY-MM-DD or ISO datetime.");
    }
}
