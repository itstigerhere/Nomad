package com.tripfactory.nomad.service.impl;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tripfactory.nomad.api.dto.AuthLoginRequest;
import com.tripfactory.nomad.api.dto.AuthRegisterRequest;
import com.tripfactory.nomad.api.dto.AuthResponse;
import com.tripfactory.nomad.api.dto.UserResponse;
import com.tripfactory.nomad.domain.entity.PasswordResetToken;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.repository.PasswordResetTokenRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.AuthService;
import com.tripfactory.nomad.service.NotificationService;
import com.tripfactory.nomad.service.ReferralService;
import com.tripfactory.nomad.service.exception.BadRequestException;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;
import com.tripfactory.nomad.service.jwt.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int RESET_TOKEN_VALIDITY_HOURS = 1;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final ReferralService referralService;

    @Value("${nomad.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public AuthResponse register(AuthRegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadRequestException("Email and password are required");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCity(request.getCity());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setInterestType(request.getInterestType());
        user.setTravelPreference(request.getTravelPreference());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        if (user.getReferralCode() == null || user.getReferralCode().isBlank()) {
            user.setReferralCode(generateReferralCode());
        }

        User saved = userRepository.save(user);
        if (request.getReferralCode() != null && !request.getReferralCode().isBlank()) {
            userRepository.findByReferralCode(request.getReferralCode().trim())
                    .ifPresent(referrer -> referralService.recordReferral(referrer.getId(), saved.getId()));
        }
        String token = jwtService.generateToken(saved.getEmail());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(toResponse(saved));
        return response;
    }

    @Override
    public AuthResponse login(AuthLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        if (!authentication.isAuthenticated()) {
            throw new BadRequestException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getPasswordHash() == null) {
            throw new BadRequestException("Password not set for user");
        }

        AuthResponse response = new AuthResponse();
        response.setToken(jwtService.generateToken(user.getEmail()));
        response.setUser(toResponse(user));
        return response;
    }

    @Override
    public UserResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    @Override
    public void requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();
        passwordResetTokenRepository.deleteByUserId(user.getId());
        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(Instant.now().plusSeconds(RESET_TOKEN_VALIDITY_HOURS * 3600L));
        passwordResetTokenRepository.save(resetToken);
        String resetLink = frontendUrl + "/auth/reset-password?token=" + token;
        notificationService.sendEmail(user.getEmail(), "NOMAD – Reset your password",
            "Hi " + user.getName() + ",\n\nClick the link below to reset your password (valid for " + RESET_TOKEN_VALIDITY_HOURS + " hour(s)):\n\n" + resetLink + "\n\nIf you didn't request this, ignore this email.");
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset link"));
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Reset link has expired");
        }
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }

    private static String generateReferralCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("NOMAD");
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(ThreadLocalRandom.current().nextInt(chars.length())));
        }
        return sb.toString();
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setCity(user.getCity());
        response.setLatitude(user.getLatitude());
        response.setLongitude(user.getLongitude());
        response.setInterestType(user.getInterestType());
        response.setTravelPreference(user.getTravelPreference());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        response.setProfilePhotoUrl(user.getProfilePhotoUrl());
        response.setReferralCode(user.getReferralCode());
        return response;
    }
}