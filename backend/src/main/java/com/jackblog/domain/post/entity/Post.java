package com.jackblog.domain.post.entity;

import com.jackblog.domain.comment.entity.Comment;
import com.jackblog.domain.reaction.entity.PostLike;
import com.jackblog.domain.reaction.entity.Reaction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 255)
    private String slug;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "content_html", nullable = false, columnDefinition = "TEXT")
    private String contentHtml;

    @Column(length = 500)
    private String excerpt;

    @Column(length = 1000)
    private String thumbnail;

    @Column(nullable = false, length = 100)
    private String category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_categories", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "category_name", nullable = false, length = 100)
    @Builder.Default
    private List<String> categories = new ArrayList<>();

    @Column(name = "reading_time")
    private Integer readingTime;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Reaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PostLike> likes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void incrementViewCount() {
        this.viewCount = this.viewCount + 1;
    }

    public void publish() {
        this.isPublished = true;
        this.publishedAt = LocalDateTime.now();
    }

    public void unpublish() {
        this.isPublished = false;
        this.publishedAt = null;
    }

    public void updateContent(String title, String content, String contentHtml, String excerpt,
                              String thumbnail, List<String> categories, Integer readingTime) {
        this.title = title;
        this.content = content;
        this.contentHtml = contentHtml;
        this.excerpt = excerpt;
        this.thumbnail = thumbnail;
        this.categories = categories == null
            ? new ArrayList<>()
            : categories.stream().collect(Collectors.toCollection(ArrayList::new));
        this.category = this.categories.isEmpty() ? null : this.categories.get(0);
        this.readingTime = readingTime;
    }
}
