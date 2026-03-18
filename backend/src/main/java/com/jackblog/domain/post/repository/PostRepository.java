package com.jackblog.domain.post.repository;

import com.jackblog.domain.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    Optional<Post> findBySlugAndIsPublishedTrue(String slug);

    boolean existsBySlug(String slug);

    Page<Post> findByIsPublishedTrueOrderByPublishedAtDesc(Pageable pageable);

    Page<Post> findByIsPublishedTrueAndCategoryOrderByPublishedAtDesc(String category, Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM Post p WHERE p.isPublished = true ORDER BY p.category")
    List<String> findAllCategories();

    // Escape LIKE wildcards so user input is treated literally.
    @Query("SELECT p FROM Post p WHERE p.isPublished = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR " +
           "LOWER(COALESCE(p.excerpt, '')) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\') " +
           "ORDER BY p.publishedAt DESC")
    List<Post> searchPosts(@Param("query") String query);

    @Query("SELECT p FROM Post p WHERE p.isPublished = true ORDER BY p.viewCount DESC")
    List<Post> findPopularPosts(Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllOrderByCreatedAtDesc(Pageable pageable);

    long countByIsPublishedTrue();
}
