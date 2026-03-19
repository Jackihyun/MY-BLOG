package com.jackblog.domain.visitor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_log", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"client_id", "visit_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false, length = 255)
    private String clientId;

    @Column(name = "visit_date", nullable = false, length = 10)
    private String visitDate;

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "referrer_host", length = 255)
    private String referrerHost;

    @Column(name = "landing_path", length = 255)
    private String landingPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
