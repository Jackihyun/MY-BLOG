package com.jackblog.domain.visitor.repository;

import com.jackblog.domain.visitor.entity.VisitorLog;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitorLogRepository extends JpaRepository<VisitorLog, Long> {

    boolean existsByClientIdAndVisitDate(String clientId, String visitDate);

    long countByVisitDate(String visitDate);

    @Query("""
        select coalesce(v.source, 'direct') as label, count(v) as count
        from VisitorLog v
        group by coalesce(v.source, 'direct')
        order by count(v) desc
        """)
    List<VisitorRouteStatProjection> findTopSources(Pageable pageable);

    @Query("""
        select coalesce(v.referrerHost, 'direct') as label, count(v) as count
        from VisitorLog v
        group by coalesce(v.referrerHost, 'direct')
        order by count(v) desc
        """)
    List<VisitorRouteStatProjection> findTopReferrers(Pageable pageable);

    @Query("""
        select coalesce(v.landingPath, '/') as label, count(v) as count
        from VisitorLog v
        group by coalesce(v.landingPath, '/')
        order by count(v) desc
        """)
    List<VisitorRouteStatProjection> findTopLandingPaths(Pageable pageable);
}
