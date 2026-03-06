package com.jackblog.domain.visitor.service;

import com.jackblog.common.exception.BadRequestException;
import com.jackblog.domain.visitor.dto.VisitorStatsResponse;
import com.jackblog.domain.visitor.entity.VisitorLog;
import com.jackblog.domain.visitor.repository.VisitorLogRepository;
import lombok.RequiredArgsConstructor;
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
    public boolean trackVisit(String clientId) {
        if (!StringUtils.hasText(clientId)) {
            throw new BadRequestException("clientId is required");
        }

        String normalizedClientId = clientId.trim();
        String today = LocalDate.now().toString();

        if (visitorLogRepository.existsByClientIdAndVisitDate(normalizedClientId, today)) {
            return false;
        }

        visitorLogRepository.save(
            VisitorLog.builder()
                .clientId(normalizedClientId)
                .visitDate(today)
                .build()
        );
        return true;
    }

    public VisitorStatsResponse getVisitorStats() {
        LocalDate todayDate = LocalDate.now();
        String today = todayDate.toString();
        String yesterday = todayDate.minusDays(1).toString();

        return VisitorStatsResponse.builder()
            .total(visitorLogRepository.count())
            .today(visitorLogRepository.countByVisitDate(today))
            .yesterday(visitorLogRepository.countByVisitDate(yesterday))
            .build();
    }
}
