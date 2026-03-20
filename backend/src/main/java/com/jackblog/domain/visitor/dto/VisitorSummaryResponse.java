package com.jackblog.domain.visitor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorSummaryResponse {
    private long total;
    private long today;
    private long yesterday;
}
