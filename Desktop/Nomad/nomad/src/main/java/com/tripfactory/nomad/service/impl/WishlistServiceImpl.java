package com.tripfactory.nomad.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripfactory.nomad.api.dto.WishlistItemRequest;
import com.tripfactory.nomad.api.dto.WishlistItemResponse;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.domain.entity.WishlistItem;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.repository.WishlistItemRepository;
import com.tripfactory.nomad.service.WishlistService;
import com.tripfactory.nomad.service.exception.BadRequestException;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WishlistItemResponse add(Long userId, WishlistItemRequest request) {
        if (request.getTargetId() == null || request.getTargetType() == null) {
            throw new BadRequestException("targetId and targetType are required");
        }
        if (!"PACKAGE".equals(request.getTargetType()) && !"CITY".equals(request.getTargetType())) {
            throw new BadRequestException("targetType must be PACKAGE or CITY");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (wishlistItemRepository.existsByUserIdAndTargetIdAndTargetType(userId, request.getTargetId(), request.getTargetType())) {
            throw new BadRequestException("Already in wishlist");
        }
        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setTargetId(request.getTargetId());
        item.setTargetType(request.getTargetType());
        item.setNotifyPriceBelow(request.getNotifyPriceBelow());
        item.setNotifyDates(request.getNotifyDates());
        WishlistItem saved = wishlistItemRepository.save(item);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void remove(Long userId, String targetId, String targetType) {
        wishlistItemRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType)
                .ifPresent(wishlistItemRepository::delete);
    }

    @Override
    public List<WishlistItemResponse> listByUser(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isInWishlist(Long userId, String targetId, String targetType) {
        return wishlistItemRepository.existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        WishlistItemResponse response = new WishlistItemResponse();
        response.setId(item.getId());
        response.setTargetId(item.getTargetId());
        response.setTargetType(item.getTargetType());
        response.setNotifyPriceBelow(item.getNotifyPriceBelow());
        response.setNotifyDates(item.getNotifyDates());
        response.setCreatedAt(item.getCreatedAt());
        return response;
    }
}
