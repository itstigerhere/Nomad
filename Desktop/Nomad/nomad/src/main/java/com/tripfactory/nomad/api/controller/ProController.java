package com.tripfactory.nomad.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripfactory.nomad.api.dto.ProStatusResponse;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.security.UserPrincipal;
import com.tripfactory.nomad.service.ProSubscriptionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pro")
@RequiredArgsConstructor
public class ProController {

    private final ProSubscriptionService proSubscriptionService;
    private final UserRepository userRepository;

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProStatusResponse> getStatus(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = userRepository.findByEmail(principal.getUsername()).map(u -> u.getId()).orElse(null);
        if (userId == null) {
            ProStatusResponse r = new ProStatusResponse();
            r.setPro(false);
            return ResponseEntity.ok(r);
        }
        ProStatusResponse response = new ProStatusResponse();
        response.setPro(proSubscriptionService.isPro(userId));
        response.setValidUntil(proSubscriptionService.getProValidUntil(userId));
        return ResponseEntity.ok(response);
    }
}
