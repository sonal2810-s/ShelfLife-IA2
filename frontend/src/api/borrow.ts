import { apiClient } from './client';
import type { BorrowRecord, ApiResponse, BorrowPayload } from '../types';

export const issueBook = async (payload: BorrowPayload): Promise<ApiResponse<BorrowRecord>> => {
  const response = await apiClient.post<ApiResponse<BorrowRecord>>('/borrow', payload);
  return response.data;
};

export const returnBook = async (borrowId: string): Promise<ApiResponse<BorrowRecord>> => {
  const response = await apiClient.post<ApiResponse<BorrowRecord>>(`/return/${borrowId}`);
  return response.data;
};
