package com.jackblog.domain.comment.service;

import com.jackblog.common.exception.BadRequestException;
import com.jackblog.common.exception.ResourceNotFoundException;
import com.jackblog.common.exception.UnauthorizedException;
import com.jackblog.domain.comment.dto.CommentCreateRequest;
import com.jackblog.domain.comment.dto.CommentResponse;
import com.jackblog.domain.comment.entity.Comment;
import com.jackblog.domain.comment.repository.CommentRepository;
import com.jackblog.domain.post.entity.Post;
import com.jackblog.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    public List<CommentResponse> getComments(String slug) {
        Post post = postRepository.findBySlug(slug)
            .orElseGet(() -> {
                if ("guestbook".equals(slug)) {
                    Post guestbook = Post.builder()
                        .slug("guestbook")
                        .title("Guest Book")
                        .content("Guest Book Content")
                        .contentHtml("<p>Guest Book Content</p>")
                        .category("System")
                        .isPublished(true)
                        .build();
                    return postRepository.save(guestbook);
                }
                throw ResourceNotFoundException.post(slug);
            });

        List<Comment> rootComments = commentRepository.findRootCommentsByPostId(post.getId());
        return CommentResponse.fromList(rootComments);
    }

    @Transactional
    public CommentResponse createComment(String slug, CommentCreateRequest request) {
        Post post = postRepository.findBySlug(slug)
            .orElseGet(() -> {
                if ("guestbook".equals(slug)) {
                    Post guestbook = Post.builder()
                        .slug("guestbook")
                        .title("Guest Book")
                        .content("Guest Book Content")
                        .contentHtml("<p>Guest Book Content</p>")
                        .category("System")
                        .isPublished(true)
                        .build();
                    return postRepository.save(guestbook);
                }
                throw ResourceNotFoundException.post(slug);
            });

        Comment comment = Comment.builder()
            .post(post)
            .authorName(request.getAuthorName())
            .authorEmail(request.getAuthorEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .content(request.getContent())
            .depth(0)
            .build();

        Comment savedComment = commentRepository.save(comment);
        return CommentResponse.from(savedComment);
    }

    @Transactional
    public CommentResponse createReply(Long parentId, CommentCreateRequest request) {
        Comment parentComment = commentRepository.findById(parentId)
            .orElseThrow(() -> ResourceNotFoundException.comment(parentId));

        if (parentComment.getDepth() >= 2) {
            throw new BadRequestException("Maximum reply depth exceeded");
        }

        Comment reply = Comment.builder()
            .post(parentComment.getPost())
            .parent(parentComment)
            .authorName(request.getAuthorName())
            .authorEmail(request.getAuthorEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .content(request.getContent())
            .depth(parentComment.getDepth() + 1)
            .build();

        Comment savedReply = commentRepository.save(reply);
        return CommentResponse.from(savedReply);
    }

    @Transactional
    public void deleteComment(Long commentId, String password, String requesterEmail) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> ResourceNotFoundException.comment(commentId));

        // 소셜 로그인 댓글인 경우 이메일로 검증
        if ("social-login".equals(password)) {
            if (comment.getAuthorEmail() == null || !comment.getAuthorEmail().equals(requesterEmail)) {
                throw new UnauthorizedException("You can only delete your own comments");
            }
        } else {
            // 일반 댓글인 경우 비밀번호로 검증
            if (!passwordEncoder.matches(password, comment.getPasswordHash())) {
                throw new UnauthorizedException("Invalid password");
            }
        }

        if (comment.hasReplies()) {
            comment.markAsDeleted();
        } else {
            commentRepository.delete(comment);
        }
    }

    @Transactional
    public void deleteCommentAdmin(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> ResourceNotFoundException.comment(commentId));

        if (comment.hasReplies()) {
            comment.markAsDeleted();
        } else {
            commentRepository.delete(comment);
        }
    }
}
