package com.urp.management.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permission_key", columnList = "permission_key")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "permission_key", nullable = false, unique = true)
    private String key;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String category;
    
    private String resource;
    
    private String action;
}
