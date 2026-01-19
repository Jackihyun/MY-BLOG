package com.jackblog.domain.reaction.repository;

import com.jackblog.domain.reaction.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByPostIdAndEmojiAndClientId(Long postId, String emoji, String clientId);

    List<Reaction> findByPostIdAndClientId(Long postId, String clientId);

    @Query("""
        SELECT r.emoji, COUNT(r)
        FROM Reaction r
        WHERE r.post.id = :postId
        GROUP BY r.emoji
        """)
    List<Object[]> countReactionsByPostId(@Param("postId") Long postId);

    @Query("""
        SELECT r.emoji, COUNT(r)
        FROM Reaction r
        WHERE r.post.slug = :slug
        GROUP BY r.emoji
        """)
    List<Object[]> countReactionsByPostSlug(@Param("slug") String slug);

    void deleteByPostIdAndEmojiAndClientId(Long postId, String emoji, String clientId);

    boolean existsByPostIdAndEmojiAndClientId(Long postId, String emoji, String clientId);
}
