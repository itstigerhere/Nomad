package com.tripfactory.nomad.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripfactory.nomad.api.dto.ContactRequest;
import com.tripfactory.nomad.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final NotificationService notificationService;

    @Value("${nomad.contact.to:admin@nomad.com}")
    private String contactTo;

    @PostMapping
    public ResponseEntity<Void> submit(@Valid @RequestBody ContactRequest request) {
        String subject = "NOMAD Contact: " + request.getName();
        String body = request.getMessage() + "\n\n---\nFrom: " + request.getEmail() + " (" + request.getName() + ")";
        notificationService.sendEmail(contactTo, subject, body);
        return ResponseEntity.ok().build();
    }
}
