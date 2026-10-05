import { apiClient } from './client';
import type { Member, BorrowRecord, ApiResponse, CreateMemberPayload } from '../types';

export const getMembers = async (): Promise<ApiResponse<Member[]>> => {
  const response = await apiClient.get<ApiResponse<Member[]>>('/members');
  return response.data;
};

export const createMember = async (payload: CreateMemberPayload): Promise<ApiResponse<Member>> => {
  const response = await apiClient.post<ApiResponse<Member>>('/members', payload);
  return response.data;
};

export interface MemberHistoryResponse {
  success: boolean;
  member: Member;
  data: BorrowRecord[];
}

export const getMemberHistory = async (memberId: string): Promise<MemberHistoryResponse> => {
  const response = await apiClient.get<MemberHistoryResponse>(`/members/${memberId}/history`);
  return response.data;
};
