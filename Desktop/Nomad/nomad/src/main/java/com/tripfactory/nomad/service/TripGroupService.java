package com.tripfactory.nomad.service;

import java.util.List;

import com.tripfactory.nomad.api.dto.TripGroupCreateRequest;
import com.tripfactory.nomad.api.dto.TripGroupMemberResponse;
import com.tripfactory.nomad.api.dto.TripGroupResponse;

public interface TripGroupService {

    TripGroupResponse createGroup(TripGroupCreateRequest request);

    TripGroupResponse getGroup(Long groupId);

    List<TripGroupMemberResponse> getGroupMembers(Long groupId);
}