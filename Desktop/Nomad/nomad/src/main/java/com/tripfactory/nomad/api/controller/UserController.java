package com.tripfactory.nomad.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.domain.entity.User;

import jakarta.validation.Valid;

import com.tripfactory.nomad.api.dto.UserCreateRequest;
import com.tripfactory.nomad.api.dto.UserResponse;
import com.tripfactory.nomad.api.dto.UserUpdateRequest;
import com.tripfactory.nomad.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${profile.photo.upload-dir:profile-photos}")
    private String uploadDir;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        return new ResponseEntity<>(userService.createUser(request), HttpStatus.CREATED);
    }

    // --- Profile Photo Upload Endpoint ---
    @PostMapping("/me/photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Only image files are allowed (e.g. JPEG, PNG)");
        }
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo");
            String ext = "";
            int i = originalFilename.lastIndexOf('.');
            if (i > 0) ext = originalFilename.substring(i);
            String filename = "user-" + user.getId() + "-" + System.currentTimeMillis() + ext;
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            java.nio.file.Files.createDirectories(uploadPath);
            java.nio.file.Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath);
            // Save the photo URL (relative path) in the user entity
            user.setProfilePhotoUrl("/api/users/photo/" + filename);
            userRepository.save(user);
            return ResponseEntity.ok().body(user.getProfilePhotoUrl());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload profile photo");
        }
    }

    // --- Profile Photo Fetch Endpoint ---
    @GetMapping("/photo/{filename:.+}")
    public ResponseEntity<Resource> getProfilePhoto(@PathVariable String filename) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = java.nio.file.Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authz.canAccessUser(#id)")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@authz.canAccessUser(#id)")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }
}