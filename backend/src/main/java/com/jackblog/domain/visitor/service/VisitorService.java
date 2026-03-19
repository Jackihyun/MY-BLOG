package com.jackblog.domain.visitor.service;

import com.jackblog.common.exception.BadRequestException;
import com.jackblog.domain.visitor.dto.VisitTrackRequest;
import com.jackblog.domain.visitor.dto.VisitorRouteStatResponse;
import com.jackblog.domain.visitor.dto.VisitorStatsResponse;
import com.jackblog.domain.visitor.entity.VisitorLog;
import com.jackblog.domain.visitor.repository.VisitorLogRepository;
import com.jackblog.domain.visitor.repository.VisitorRouteStatProjection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VisitorService {

    private final VisitorLogRepository visitorLogRepository;

    @Transactional
    public boolean trackVisit(VisitTrackRequest request) {
        if (request == null || !StringUtils.hasText(request.getClientId())) {
            throw new BadRequestException("clientId is required");
        }

        String normalizedClientId = request.getClientId().trim();
        String today = LocalDate.now().toString();

        if (visitorLogRepository.existsByClientIdAndVisitDate(normalizedClientId, today)) {
            return false;
        }

        visitorLogRepository.save(
            VisitorLog.builder()
                .clientId(normalizedClientId)
                .visitDate(today)
                .source(normalizeSource(request.getSource()))
                .referrerHost(normalizeReferrerHost(request.getReferrerHost()))
                .landingPath(normalizeLandingPath(request.getLandingPath()))
                .build()
        );
        return true;
    }

    public VisitorStatsResponse getVisitorStats() {
        LocalDate todayDate = LocalDate.now();
        String today = todayDate.toString();
        String yesterday = todayDate.minusDays(1).toString();
        PageRequest topFive = PageRequest.of(0, 5);

        return VisitorStatsResponse.builder()
            .total(visitorLogRepository.count())
            .today(visitorLogRepository.countByVisitDate(today))
            .yesterday(visitorLogRepository.countByVisitDate(yesterday))
            .topSources(mapRouteStats(visitorLogRepository.findTopSources(topFive)))
            .topReferrers(mapRouteStats(visitorLogRepository.findTopReferrers(topFive)))
            .topLandingPaths(mapRouteStats(visitorLogRepository.findTopLandingPaths(topFive)))
            .build();
    }

    private List<VisitorRouteStatResponse> mapRouteStats(List<VisitorRouteStatProjection> stats) {
        return stats.stream()
            .map(item -> VisitorRouteStatResponse.builder()
                .label(item.getLabel())
                .count(item.getCount())
                .build())
            .toList();
    }

    private String normalizeSource(String source) {
        if (!StringUtils.hasText(source)) {
            return "direct";
        }

        String normalized = source.trim().toLowerCase();
        return normalized.length() > 50 ? normalized.substring(0, 50) : normalized;
    }

    private String normalizeReferrerHost(String referrerHost) {
        if (!StringUtils.hasText(referrerHost)) {
            return "direct";
        }

        String normalized = referrerHost.trim().toLowerCase();
        return normalized.length() > 255 ? normalized.substring(0, 255) : normalized;
    }

    private String normalizeLandingPath(String landingPath) {
        if (!StringUtils.hasText(landingPath)) {
            return "/";
        }

        String normalized = landingPath.trim();
        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }

        return normalized.length() > 255 ? normalized.substring(0, 255) : normalized;
    }
}
