import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { PostData } from "@/types";

export type { PostData };

const postsDirectory = path.join(process.cwd(), "src/posts");
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const USE_API = true;

// ============ API-based functions ============

async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

function apiPostToPostData(apiPost: {
  slug: string;
  title: string;
  publishedAt: string;
  category: string;
  contentHtml: string;
  excerpt?: string;
  readingTime?: number;
  viewCount?: number;
}): PostData {
  return {
    id: apiPost.slug,
    slug: apiPost.slug,
    title: apiPost.title,
    date: apiPost.publishedAt
      ? new Date(apiPost.publishedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    category: apiPost.category,
    contentHtml: apiPost.contentHtml,
    excerpt: apiPost.excerpt,
    readingTime: apiPost.readingTime,
    viewCount: apiPost.viewCount,
  };
}

// ============ File-based functions (Legacy) ============

async function getPostDataFromFile(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    slug: id,
    contentHtml,
    ...(matterResult.data as { title: string; date: string; category: string }),
  };
}

async function getSortedPostsDataFromFile(): Promise<PostData[]> {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    fileNames.map(async (fileName) => {
      const id = fileName.replace(/\.md$/, "");
      return getPostDataFromFile(id);
    })
  );

  return allPostsData.sort((a, b) => {
    return a.date < b.date ? 1 : -1;
  });
}

function getAllPostIdsFromFile() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    id: fileName.replace(/\.md$/, ""),
  }));
}

// ============ Hybrid functions (API with File fallback) ============

interface ApiPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

interface ApiPostResponse {
  slug: string;
  title: string;
  publishedAt: string;
  category: string;
  contentHtml: string;
  excerpt?: string;
  readingTime?: number;
  viewCount?: number;
}

export async function getSortedPostsData(): Promise<PostData[]> {
  if (USE_API) {
    const apiData = await fetchFromApi<ApiPageResponse<ApiPostResponse>>(
      "/posts?size=100"
    );
    if (apiData && apiData.content) {
      return apiData.content.map(apiPostToPostData);
    }
  }

  try {
    return await getSortedPostsDataFromFile();
  } catch (error) {
    console.error("Failed to read posts from file system:", error);
    return [];
  }
}

export function getAllPostIds(): { id: string }[] {
  return getAllPostIdsFromFile();
}

interface ApiPostDetailResponse extends ApiPostResponse {
  content: string;
}

export async function getPostData(id: string): Promise<PostData> {
  if (USE_API) {
    const apiPost = await fetchFromApi<ApiPostDetailResponse>(`/posts/${id}`);
    if (apiPost) {
      return apiPostToPostData(apiPost);
    }
  }

  // Fallback to dummy data to avoid crash if file is missing
  try {
    return await getPostDataFromFile(id);
  } catch (error) {
    console.warn(`Post ${id} not found in file system, returning dummy data`);
    return {
      id,
      slug: id,
      title: "글을 찾을 수 없습니다",
      date: new Date().toISOString().split("T")[0],
      category: "None",
      contentHtml: "<p>요청하신 글이 존재하지 않거나 불러오는데 실패했습니다.</p>",
    };
  }
}

// ============ Search function ============

export async function searchPosts(query: string): Promise<PostData[]> {
  if (USE_API) {
    const apiPosts = await fetchFromApi<ApiPostResponse[]>(
      `/posts/search?q=${encodeURIComponent(query)}`
    );
    if (apiPosts) {
      return apiPosts.map(apiPostToPostData);
    }
  }

  const allPosts = await getSortedPostsDataFromFile();
  const lowerQuery = query.toLowerCase();

  return allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.contentHtml.toLowerCase().includes(lowerQuery) ||
      post.category.toLowerCase().includes(lowerQuery)
  );
}

// ============ Categories function ============

export async function getCategories(): Promise<string[]> {
  if (USE_API) {
    const categories = await fetchFromApi<string[]>("/posts/categories");
    if (categories) {
      return categories;
    }
  }

  const allPosts = await getSortedPostsDataFromFile();
  const categories = Array.from(new Set(allPosts.map((post) => post.category)));
  return categories.sort();
}

// ============ Filtered posts function ============

export async function getPostsByCategory(category: string): Promise<PostData[]> {
  if (USE_API) {
    const apiData = await fetchFromApi<ApiPageResponse<ApiPostResponse>>(
      `/posts?category=${encodeURIComponent(category)}&size=100`
    );
    if (apiData && apiData.content) {
      return apiData.content.map(apiPostToPostData);
    }
  }

  const allPosts = await getSortedPostsDataFromFile();
  return allPosts.filter((post) => post.category === category);
}
