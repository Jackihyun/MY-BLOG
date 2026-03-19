package com.jackblog.domain.visitor.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorStatsResponse {
    private long total;
    private long today;
    private long yesterday;
    private List<VisitorRouteStatResponse> topSources;
    private List<VisitorRouteStatResponse> topReferrers;
    private List<VisitorRouteStatResponse> topLandingPaths;
}
