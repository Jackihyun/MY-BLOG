import {
  ApiResponse,
  PageResponse,
  PostResponse,
  PostDetailResponse,
  PostCreateRequest,
  PostUpdateRequest,
  CommentResponse,
  CommentCreateRequest,
  ReactionResponse,
  ReactionRequest,
  LikeResponse,
  LoginResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const data: ApiResponse<T> = await response.json();
  return data.data;
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// ============ Post API ============

export async function fetchPosts(
  page = 0,
  size = 10,
  category?: string
): Promise<PageResponse<PostResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  if (category) {
    params.append("category", category);
  }
  return fetchApi<PageResponse<PostResponse>>(`/posts?${params}`);
}

export async function fetchAllPosts(
  page = 0,
  size = 10
): Promise<PageResponse<PostResponse>> {
  return fetchApi<PageResponse<PostResponse>>(
    `/posts/all?page=${page}&size=${size}`
  );
}

export async function fetchPost(slug: string): Promise<PostDetailResponse> {
  return fetchApi<PostDetailResponse>(`/posts/${slug}`);
}

export async function fetchPostAdmin(
  slug: string,
  token: string
): Promise<PostDetailResponse> {
  return fetchApi<PostDetailResponse>(`/posts/${slug}/admin`, {
    headers: getAuthHeaders(token),
  });
}

export async function incrementViewCount(slug: string): Promise<void> {
  await fetchApi<void>(`/posts/${slug}/view`, {
    method: "POST",
  });
}

export async function createPost(
  data: PostCreateRequest,
  token: string
): Promise<PostResponse> {
  return fetchApi<PostResponse>("/posts", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updatePost(
  slug: string,
  data: PostUpdateRequest,
  token: string
): Promise<PostResponse> {
  return fetchApi<PostResponse>(`/posts/${slug}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deletePost(slug: string, token: string): Promise<void> {
  await fetchApi<void>(`/posts/${slug}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
}

export async function searchPosts(query: string): Promise<PostResponse[]> {
  return fetchApi<PostResponse[]>(`/posts/search?q=${encodeURIComponent(query)}`);
}

export async function fetchCategories(): Promise<string[]> {
  return fetchApi<string[]>("/posts/categories");
}

export async function fetchPopularPosts(limit = 5): Promise<PostResponse[]> {
  return fetchApi<PostResponse[]>(`/posts/popular?limit=${limit}`);
}

// ============ Comment API ============

export async function fetchComments(slug: string): Promise<CommentResponse[]> {
  return fetchApi<CommentResponse[]>(`/posts/${slug}/comments`);
}

export async function createComment(
  slug: string,
  data: CommentCreateRequest
): Promise<CommentResponse> {
  return fetchApi<CommentResponse>(`/posts/${slug}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createReply(
  commentId: number,
  data: CommentCreateRequest
): Promise<CommentResponse> {
  return fetchApi<CommentResponse>(`/comments/${commentId}/reply`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteComment(
  commentId: number,
  password: string,
  requesterEmail?: string
): Promise<void> {
  await fetchApi<void>(`/comments/${commentId}`, {
    method: "DELETE",
    body: JSON.stringify({ password, requesterEmail }),
  });
}

export async function deleteCommentAdmin(
  commentId: number,
  token: string
): Promise<void> {
  await fetchApi<void>(`/comments/${commentId}/admin`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
}

// ============ Reaction API ============

export async function fetchReactions(
  slug: string,
  clientId?: string
): Promise<ReactionResponse> {
  const params = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
  return fetchApi<ReactionResponse>(`/posts/${slug}/reactions${params}`);
}

export async function toggleReaction(
  slug: string,
  data: ReactionRequest
): Promise<ReactionResponse> {
  return fetchApi<ReactionResponse>(`/posts/${slug}/reactions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function toggleLike(
  slug: string,
  clientId: string
): Promise<LikeResponse> {
  return fetchApi<LikeResponse>(
    `/posts/${slug}/reactions/like?clientId=${encodeURIComponent(clientId)}`,
    {
      method: "POST",
    }
  );
}

export async function fetchLikeStatus(
  slug: string,
  clientId: string
): Promise<LikeResponse> {
  return fetchApi<LikeResponse>(
    `/posts/${slug}/reactions/like?clientId=${encodeURIComponent(clientId)}`
  );
}

// ============ Auth API ============

export async function login(password: string): Promise<LoginResponse> {
  return fetchApi<LoginResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function verifyToken(
  token: string
): Promise<{ valid: boolean; subject: string }> {
  return fetchApi<{ valid: boolean; subject: string }>("/admin/verify", {
    headers: getAuthHeaders(token),
  });
}

// ============ Client ID Utils ============

export function getClientId(): string {
  if (typeof window === "undefined") return "";

  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
}
