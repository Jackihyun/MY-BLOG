package com.jackblog.domain.visitor.repository;

import com.jackblog.domain.visitor.entity.VisitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitorLogRepository extends JpaRepository<VisitorLog, Long> {

    boolean existsByClientIdAndVisitDate(String clientId, String visitDate);

    long countByVisitDate(String visitDate);
}
