package com.jackblog.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private long expiresIn;

    public static LoginResponse of(String token, long expiresIn) {
        return LoginResponse.builder()
            .token(token)
            .expiresIn(expiresIn)
            .build();
    }
}
