export interface Book {
  _id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowRecord {
  _id: string;
  book: Book | string;
  member: Member | string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'issued' | 'returned' | 'overdue';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    role: string;
    email: string;
  };
  message?: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies?: number;
}

export interface CreateMemberPayload {
  name: string;
  email: string;
  membershipId: string;
  joinedDate?: string;
}

export interface BorrowPayload {
  bookId: string;
  memberId: string;
}
