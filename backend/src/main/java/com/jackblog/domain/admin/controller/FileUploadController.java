package com.jackblog.domain.admin.controller;

import com.jackblog.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin")
public class FileUploadController {

    @Value("${file.upload-dir:./data/uploads}")
    private String uploadDir;

    @Value("${app.base-url:https://blog.jackihyun.com}")
    private String baseUrl;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("파일이 비어있습니다."));
        }

        try {
            Path directoryPath = Paths.get(uploadDir);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = directoryPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            String fileUrl = baseUrl + "/api/uploads/" + fileName;
            // Note: If Caddy handles /api/* by proxying to 8080, 
            // and Spring handles /uploads/**, then /api/uploads/** will work.
            
            return ResponseEntity.ok(ApiResponse.success("파일 업로드 성공", fileUrl));
        } catch (IOException e) {
            log.error("File upload failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("파일 업로드 중 오류가 발생했습니다."));
        }
    }
}
