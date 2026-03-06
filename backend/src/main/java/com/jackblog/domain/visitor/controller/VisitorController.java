package com.jackblog.domain.visitor.controller;

import com.jackblog.common.response.ApiResponse;
import com.jackblog.domain.visitor.dto.VisitTrackResponse;
import com.jackblog.domain.visitor.dto.VisitorStatsResponse;
import com.jackblog.domain.visitor.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;

    @PostMapping("/track")
    public ResponseEntity<ApiResponse<VisitTrackResponse>> trackVisit(
        @RequestParam String clientId
    ) {
        boolean counted = visitorService.trackVisit(clientId);
        return ResponseEntity.ok(ApiResponse.success(
            VisitTrackResponse.builder().counted(counted).build()
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<VisitorStatsResponse>> getVisitorStats() {
        VisitorStatsResponse stats = visitorService.getVisitorStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
