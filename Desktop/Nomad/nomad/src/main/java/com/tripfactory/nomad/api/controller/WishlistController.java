package com.tripfactory.nomad.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tripfactory.nomad.api.dto.WishlistItemRequest;
import com.tripfactory.nomad.api.dto.WishlistItemResponse;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.security.AuthorizationService;
import com.tripfactory.nomad.service.WishlistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final AuthorizationService authz;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WishlistItemResponse> add(@Valid @RequestBody WishlistItemRequest request) {
        Long userId = authz.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return new ResponseEntity<>(wishlistService.add(userId, request), HttpStatus.CREATED);
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> remove(@RequestParam String targetId, @RequestParam String targetType) {
        Long userId = authz.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        wishlistService.remove(userId, targetId, targetType);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WishlistItemResponse>> list() {
        Long userId = authz.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(wishlistService.listByUser(userId));
    }

    @GetMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> check(@RequestParam String targetId, @RequestParam String targetType) {
        Long userId = authz.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(wishlistService.isInWishlist(userId, targetId, targetType));
    }
}
