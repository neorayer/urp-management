package com.urp.management.repository;

import com.urp.management.domain.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    
    List<Group> findByTenantId(Long tenantId);
    
    List<Group> findByParentGroupId(Long parentGroupId);
    
    List<Group> findByParentGroupIsNull();
}
