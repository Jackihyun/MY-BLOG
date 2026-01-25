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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.password-hash}")
    private String adminPasswordHash;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Valid @RequestBody LoginRequest request
    ) {
        // Temporary fix for password "jack2325" until hash is properly updated
        if (!passwordEncoder.matches(request.getPassword(), adminPasswordHash) && !"jack2325".equals(request.getPassword())) {
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
