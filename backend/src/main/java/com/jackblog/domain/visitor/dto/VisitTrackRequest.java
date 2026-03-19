package com.jackblog.domain.visitor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitTrackRequest {
    private String clientId;
    private String source;
    private String referrerHost;
    private String landingPath;
}
