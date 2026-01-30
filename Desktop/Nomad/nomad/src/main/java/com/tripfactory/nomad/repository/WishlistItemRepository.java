package com.tripfactory.nomad.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripfactory.nomad.domain.entity.WishlistItem;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<WishlistItem> findByUserIdAndTargetIdAndTargetType(Long userId, String targetId, String targetType);

    boolean existsByUserIdAndTargetIdAndTargetType(Long userId, String targetId, String targetType);

    List<WishlistItem> findByTargetTypeAndNotifyPriceBelowNotNull(String targetType);
}
