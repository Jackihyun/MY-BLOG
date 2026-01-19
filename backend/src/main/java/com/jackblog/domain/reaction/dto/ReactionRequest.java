package com.jackblog.domain.reaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionRequest {

    @NotBlank(message = "Emoji is required")
    @Size(max = 10, message = "Emoji must be less than 10 characters")
    private String emoji;

    @NotBlank(message = "Client ID is required")
    private String clientId;
}
