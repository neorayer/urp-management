package com.urp.management.repository;

import com.urp.management.domain.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    Optional<Permission> findByKey(String key);
    
    List<Permission> findByCategory(String category);
    
    List<Permission> findByResource(String resource);
}
