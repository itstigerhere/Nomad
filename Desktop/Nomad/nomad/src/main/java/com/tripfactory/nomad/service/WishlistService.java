package com.tripfactory.nomad.service;

import java.util.List;

import com.tripfactory.nomad.api.dto.WishlistItemRequest;
import com.tripfactory.nomad.api.dto.WishlistItemResponse;

public interface WishlistService {

    WishlistItemResponse add(Long userId, WishlistItemRequest request);

    void remove(Long userId, String targetId, String targetType);

    List<WishlistItemResponse> listByUser(Long userId);

    boolean isInWishlist(Long userId, String targetId, String targetType);
}
