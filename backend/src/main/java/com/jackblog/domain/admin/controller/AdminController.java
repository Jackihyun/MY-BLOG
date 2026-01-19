package com.jackblog.domain.admin.controller;

import com.jackblog.common.exception.UnauthorizedException;
import com.jackblog.common.response.ApiResponse;
import com.jackblog.config.JwtConfig;
import com.jackblog.domain.admin.dto.LoginRequest;
import com.jackblog.domain.admin.dto.LoginResponse;
import com.jackblog.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;

    @Value("${admin.password}")
    private String adminPassword;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Valid @RequestBody LoginRequest request
    ) {
        if (!adminPassword.equals(request.getPassword())) {
            throw new UnauthorizedException("Invalid password");
        }

        String token = jwtTokenProvider.createToken("admin");
        LoginResponse response = LoginResponse.of(token, jwtConfig.getExpiration());

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verify(
        @RequestHeader("Authorization") String authorization
    ) {
        String token = authorization.replace("Bearer ", "");

        if (!jwtTokenProvider.validateToken(token)) {
            throw new UnauthorizedException("Invalid or expired token");
        }

        String subject = jwtTokenProvider.getSubject(token);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "valid", true,
            "subject", subject
        )));
    }
}
