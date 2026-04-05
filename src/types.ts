export interface User {
  id: string; // uuid v4
  login: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: number; // timestamp of creation
  updatedAt: number; // timestamp of last update
}

export interface Article {
  id: string; // uuid v4
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  authorId: string | null; // refers to User
  categoryId: string | null; // refers to Category
  tags: string[]; // array of tag names
  createdAt: number; // timestamp of creation
  updatedAt: number; // timestamp of last update
}
export interface Category {
  id: string; // uuid v4
  name: string;
  description: string;
}
export interface Comment {
  id: string; // uuid v4
  content: string;
  articleId: string; // refers to Article
  authorId: string | null; // refers to User
  createdAt: number; // timestamp of creation
}
export interface CreateUserDto {
  login: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer'; // defaults to 'viewer'
}
export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  data: Array<T>;
}
