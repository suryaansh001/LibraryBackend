export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AuthenticatedUser {
  id: string;
  libraryId: string;
  role: 'owner' | 'staff' | 'receptionist' | 'student';
  email: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface RequestContext {
  requestId: string;
  libraryId: string;
  user?: AuthenticatedUser;
}