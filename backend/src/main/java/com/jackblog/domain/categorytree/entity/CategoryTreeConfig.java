package com.jackblog.domain.categorytree.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "category_tree_config")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTreeConfig {

    @Id
    @Column(name = "id")
    private Long id;

    @Lob
    @Column(name = "payload_json", nullable = false)
    private String payloadJson;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updatePayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }
}
