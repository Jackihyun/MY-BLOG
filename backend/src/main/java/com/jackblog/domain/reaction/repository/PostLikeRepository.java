package com.jackblog.domain.reaction.repository;

import com.jackblog.domain.reaction.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostIdAndClientId(Long postId, String clientId);

    boolean existsByPostIdAndClientId(Long postId, String clientId);

    void deleteByPostIdAndClientId(Long postId, String clientId);

    long countByPostId(Long postId);
}
