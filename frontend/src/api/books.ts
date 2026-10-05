import { apiClient } from './client';
import type { Book, ApiResponse, CreateBookPayload } from '../types';

export interface GetBooksParams {
  page?: number;
  limit?: number;
  genre?: string;
  search?: string;
}

export const getBooks = async (params: GetBooksParams = {}): Promise<ApiResponse<Book[]>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.genre) queryParams.append('genre', params.genre);
  if (params.search) queryParams.append('search', params.search);

  const response = await apiClient.get<ApiResponse<Book[]>>(`/books?${queryParams.toString()}`);
  return response.data;
};

export const createBook = async (payload: CreateBookPayload): Promise<ApiResponse<Book>> => {
  const response = await apiClient.post<ApiResponse<Book>>('/books', payload);
  return response.data;
};
