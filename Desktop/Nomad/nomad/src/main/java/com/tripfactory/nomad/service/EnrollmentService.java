package com.tripfactory.nomad.service;

import com.tripfactory.nomad.api.dto.EnrollmentRequest;
import com.tripfactory.nomad.api.dto.EnrollmentResponse;

public interface EnrollmentService {
    EnrollmentResponse enroll(EnrollmentRequest request);
}
