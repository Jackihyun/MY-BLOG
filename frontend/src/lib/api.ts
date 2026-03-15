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
  VisitorStatsResponse,
  VisitTrackResponse,
  CategoryTreeResponse,
} from "@/types";

const SERVER_API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api";
const CLIENT_API_BASE =
  (process.env.NEXT_PUBLIC_API_PROXY_PATH || "/api")
    .replace(/\/$/, "")
    .replace(/\/api\/proxy(?=\/|$)/, "/api");

const API_BASE =
  typeof window === "undefined" ? SERVER_API_BASE : CLIENT_API_BASE;

class ApiError extends Error {
  constructor(public status: number, message: string) {
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
  return fetchApi<PostResponse[]>(
    `/posts/search?q=${encodeURIComponent(query)}`
  );
}

export async function fetchCategories(): Promise<string[]> {
  return fetchApi<string[]>("/posts/categories");
}

export async function fetchPopularPosts(limit = 5): Promise<PostResponse[]> {
  return fetchApi<PostResponse[]>(`/posts/popular?limit=${limit}`);
}

// ============ Visitor API ============

export async function trackVisitor(clientId: string): Promise<VisitTrackResponse> {
  return fetchApi<VisitTrackResponse>(
    `/visitors/track?clientId=${encodeURIComponent(clientId)}`,
    {
      method: "POST",
    }
  );
}

export async function fetchVisitorStats(): Promise<VisitorStatsResponse> {
  return fetchApi<VisitorStatsResponse>("/visitors/stats");
}

// ============ Category Tree API ============

export async function fetchCategoryTree(): Promise<CategoryTreeResponse> {
  return fetchApi<CategoryTreeResponse>("/category-tree");
}

export async function updateCategoryTree(
  data: CategoryTreeResponse,
  token: string
): Promise<CategoryTreeResponse> {
  return fetchApi<CategoryTreeResponse>("/category-tree", {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
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

// ============ File Upload API ============

async function optimizeImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") {
    return file;
  }

  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
      img.src = objectUrl;
    });

    const maxDimension = 1600;
    const needsResize =
      image.width > maxDimension || image.height > maxDimension;
    const shouldCompress = file.size > 700 * 1024 || needsResize;

    if (!shouldCompress) {
      return file;
    }

    const scale = Math.min(
      maxDimension / image.width,
      maxDimension / image.height,
      1
    );
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const outputType =
      file.type === "image/png" ? "image/png" : "image/jpeg";
    const quality = outputType === "image/jpeg" ? 0.82 : undefined;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, quality);
    });

    if (!blob) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const extension = outputType === "image/png" ? "png" : "jpg";
    const optimized = new File([blob], `${baseName}.${extension}`, {
      type: outputType,
      lastModified: file.lastModified,
    });

    if (optimized.size >= file.size * 0.95 && !needsResize) {
      return file;
    }

    return optimized;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const optimizedFile = await optimizeImageForUpload(file);
  const formData = new FormData();
  formData.append("file", optimizedFile);

  const response = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || "이미지 업로드에 실패했습니다."
    );
  }

  const data: ApiResponse<string> = await response.json();
  return normalizeUploadedImageUrl(data.data);
}

export function isUploadedImageUrl(url?: string | null): boolean {
  if (!url) return false;

  return (
    url.startsWith("/api/uploads/") ||
    url.startsWith("/uploads/") ||
    /^https?:\/\/[^/]+\/(?:api\/)?uploads\//i.test(url)
  );
}

export function getDisplayImageUrl(url?: string | null): string {
  if (!url) return "";

  if (!isUploadedImageUrl(url) || !url.startsWith("/")) {
    return url;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!siteUrl) {
    return url;
  }

  return `${siteUrl.replace(/\/$/, "")}${url}`;
}

function normalizeUploadedImageUrl(url: string): string {
  if (!url) return url;

  if (url.startsWith("/api/uploads/")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `/api${url}`;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/api/uploads/")) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      if (parsed.pathname.startsWith("/uploads/")) {
        return `/api${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return url;
    }
  }

  return url;
}

export interface LegacyPostResponse {
  slug: string;
  title: string;
  category: string;
  contentHtml: string;
  excerpt?: string;
}

export async function fetchLegacyPost(slug: string): Promise<LegacyPostResponse> {
  const response = await fetch(`/api/admin/legacy-post/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new ApiError(response.status, "Legacy post not found");
  }
  return response.json();
}

// ============ Client ID Utils ============

export function getClientId(): string {
  if (typeof window === "undefined") return "";

  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
}
