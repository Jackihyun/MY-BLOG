// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Post Types
export interface PostResponse {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface PostDetailResponse extends PostResponse {
  content: string;
  contentHtml: string;
  commentCount: number;
  likeCount: number;
}

export interface PostCreateRequest {
  slug?: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  publish?: boolean;
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  publish?: boolean;
}

// Comment Types
export interface CommentResponse {
  id: number;
  authorName: string;
  authorEmail?: string;
  content: string;
  depth: number;
  isDeleted: boolean;
  createdAt: string;
  replies: CommentResponse[];
}

export interface CommentCreateRequest {
  authorName: string;
  authorEmail?: string;
  password: string;
  content: string;
}

// Reaction Types
export interface ReactionResponse {
  counts: Record<string, number>;
  userReactions: string[];
}

export interface ReactionRequest {
  emoji: string;
  clientId: string;
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

// Auth Types
export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

// Legacy PostData for backward compatibility
export interface PostData {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  contentHtml: string;
  excerpt?: string;
  readingTime?: number;
  viewCount?: number;
}
