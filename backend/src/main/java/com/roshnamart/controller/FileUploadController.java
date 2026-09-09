package com.roshnamart.controller;

import com.roshnamart.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "Endpoints for uploading images for products and profiles")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping
    @Operation(summary = "Upload an image file (JPEG, PNG, WebP)")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String url = fileUploadService.storeFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
