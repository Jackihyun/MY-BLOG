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

    @Query(
        value = """
            SELECT DISTINCT p.*
            FROM post p
            LEFT JOIN post_categories pc ON pc.post_id = p.id
            WHERE p.is_published = 1
              AND (p.category = :category OR pc.category_name = :category)
            ORDER BY p.published_at DESC
            """,
        countQuery = """
            SELECT COUNT(DISTINCT p.id)
            FROM post p
            LEFT JOIN post_categories pc ON pc.post_id = p.id
            WHERE p.is_published = 1
              AND (p.category = :category OR pc.category_name = :category)
            """,
        nativeQuery = true
    )
    Page<Post> findPublishedByCategory(@Param("category") String category, Pageable pageable);

    @Query(
        value = """
            SELECT DISTINCT category_name
            FROM (
                SELECT p.category AS category_name
                FROM post p
                WHERE p.is_published = 1
                  AND p.category IS NOT NULL
                  AND TRIM(p.category) <> ''
                UNION
                SELECT pc.category_name AS category_name
                FROM post_categories pc
                INNER JOIN post p ON p.id = pc.post_id
                WHERE p.is_published = 1
                  AND pc.category_name IS NOT NULL
                  AND TRIM(pc.category_name) <> ''
            )
            ORDER BY category_name
            """,
        nativeQuery = true
    )
    List<String> findAllCategories();

    // Escape LIKE wildcards so user input is treated literally.
    @Query(
        value = """
            SELECT DISTINCT p.*
            FROM post p
            LEFT JOIN post_categories pc ON pc.post_id = p.id
            WHERE p.is_published = 1
              AND (
                LOWER(p.title) LIKE '%' || LOWER(:query) || '%' ESCAPE '\\'
                OR LOWER(p.content) LIKE '%' || LOWER(:query) || '%' ESCAPE '\\'
                OR LOWER(COALESCE(p.excerpt, '')) LIKE '%' || LOWER(:query) || '%' ESCAPE '\\'
                OR LOWER(COALESCE(p.category, '')) LIKE '%' || LOWER(:query) || '%' ESCAPE '\\'
                OR LOWER(COALESCE(pc.category_name, '')) LIKE '%' || LOWER(:query) || '%' ESCAPE '\\'
              )
            ORDER BY p.published_at DESC
            """,
        nativeQuery = true
    )
    List<Post> searchPosts(@Param("query") String query);

    @Query("SELECT p FROM Post p WHERE p.isPublished = true AND p.slug <> 'guestbook' ORDER BY p.viewCount DESC")
    List<Post> findPopularPosts(Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllOrderByCreatedAtDesc(Pageable pageable);

    long countByIsPublishedTrue();
}
