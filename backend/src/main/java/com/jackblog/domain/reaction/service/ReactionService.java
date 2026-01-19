package com.jackblog.domain.reaction.service;

import com.jackblog.common.exception.BadRequestException;
import com.jackblog.common.exception.ResourceNotFoundException;
import com.jackblog.domain.post.entity.Post;
import com.jackblog.domain.post.repository.PostRepository;
import com.jackblog.domain.reaction.dto.ReactionResponse;
import com.jackblog.domain.reaction.entity.PostLike;
import com.jackblog.domain.reaction.entity.Reaction;
import com.jackblog.domain.reaction.repository.PostLikeRepository;
import com.jackblog.domain.reaction.repository.ReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;

    private static final Set<String> ALLOWED_EMOJIS = Set.of("👍", "❤️", "🎉", "🤔", "👀", "🚀");

    public ReactionResponse getReactions(String slug, String clientId) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));

        Map<String, Long> counts = getReactionCounts(post.getId());
        List<String> userReactions = getUserReactions(post.getId(), clientId);

        return ReactionResponse.of(counts, userReactions);
    }

    @Transactional
    public ReactionResponse toggleReaction(String slug, String emoji, String clientId) {
        if (!ALLOWED_EMOJIS.contains(emoji)) {
            throw new BadRequestException("Invalid emoji: " + emoji);
        }

        Post post = postRepository.findBySlugAndIsPublishedTrue(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));

        Optional<Reaction> existingReaction = reactionRepository
            .findByPostIdAndEmojiAndClientId(post.getId(), emoji, clientId);

        if (existingReaction.isPresent()) {
            reactionRepository.delete(existingReaction.get());
        } else {
            Reaction reaction = Reaction.builder()
                .post(post)
                .emoji(emoji)
                .clientId(clientId)
                .build();
            reactionRepository.save(reaction);
        }

        Map<String, Long> counts = getReactionCounts(post.getId());
        List<String> userReactions = getUserReactions(post.getId(), clientId);

        return ReactionResponse.of(counts, userReactions);
    }

    @Transactional
    public boolean toggleLike(String slug, String clientId) {
        Post post = postRepository.findBySlugAndIsPublishedTrue(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));

        Optional<PostLike> existingLike = postLikeRepository
            .findByPostIdAndClientId(post.getId(), clientId);

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            return false;
        } else {
            PostLike like = PostLike.builder()
                .post(post)
                .clientId(clientId)
                .build();
            postLikeRepository.save(like);
            return true;
        }
    }

    public boolean hasLiked(String slug, String clientId) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));
        return postLikeRepository.existsByPostIdAndClientId(post.getId(), clientId);
    }

    public long getLikeCount(String slug) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> ResourceNotFoundException.post(slug));
        return postLikeRepository.countByPostId(post.getId());
    }

    private Map<String, Long> getReactionCounts(Long postId) {
        List<Object[]> results = reactionRepository.countReactionsByPostId(postId);
        Map<String, Long> counts = new HashMap<>();

        for (String emoji : ALLOWED_EMOJIS) {
            counts.put(emoji, 0L);
        }

        for (Object[] result : results) {
            String emoji = (String) result[0];
            Long count = (Long) result[1];
            counts.put(emoji, count);
        }

        return counts;
    }

    private List<String> getUserReactions(Long postId, String clientId) {
        if (clientId == null || clientId.isEmpty()) {
            return new ArrayList<>();
        }

        return reactionRepository.findByPostIdAndClientId(postId, clientId)
            .stream()
            .map(Reaction::getEmoji)
            .collect(Collectors.toList());
    }
}
