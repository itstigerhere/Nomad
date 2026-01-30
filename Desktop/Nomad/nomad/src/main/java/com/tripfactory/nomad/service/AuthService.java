package com.tripfactory.nomad.service;

import com.tripfactory.nomad.api.dto.AuthLoginRequest;
import com.tripfactory.nomad.api.dto.AuthRegisterRequest;
import com.tripfactory.nomad.api.dto.AuthResponse;
import com.tripfactory.nomad.api.dto.UserResponse;

public interface AuthService {

    AuthResponse register(AuthRegisterRequest request);

    AuthResponse login(AuthLoginRequest request);

    UserResponse me(String email);

    /** Send password reset link to email if user exists. Always returns success to avoid email enumeration. */
    void requestPasswordReset(String email);

    /** Reset password using token from email link. */
    void resetPassword(String token, String newPassword);
}