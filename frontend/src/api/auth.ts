import { apiClient } from './client';
import type { LoginResponse } from '../types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password
  });
  return response.data;
};
