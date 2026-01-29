import { api } from "./api";

export type TripGroupResponse = {
  id: number;
  city: string;
  interest: string;
  weekendType: string;
  status: string;
  size: number;
  createdAt: string;
};

export type TripGroupMemberResponse = {
  tripRequestId: number;
  userId: number;
  name: string;
  city: string;
  interestType: string;
  tripStatus: string;
  joinedAt: string;
  travelDate?: string | number[];
};

export type TripGroupCreatePayload = {
  city: string;
  interest: string;
  weekendType: string;
};

export async function fetchGroup(groupId: number) {
  const { data } = await api.get(`/api/groups/${groupId}`);
  return data as TripGroupResponse;
}

export async function fetchGroupMembers(groupId: number) {
  const { data } = await api.get(`/api/groups/${groupId}/members`);
  return data as TripGroupMemberResponse[];
}

/** POST /api/groups - create a new trip group */
export async function createGroup(payload: TripGroupCreatePayload) {
  const { data } = await api.post("/api/groups", payload);
  return data as TripGroupResponse;
}
