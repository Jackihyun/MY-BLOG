package com.jackblog.domain.reaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionResponse {
    private Map<String, Long> counts;
    private List<String> userReactions;

    public static ReactionResponse of(Map<String, Long> counts, List<String> userReactions) {
        return ReactionResponse.builder()
            .counts(counts)
            .userReactions(userReactions)
            .build();
    }
}
