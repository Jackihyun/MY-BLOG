"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPosts, fetchPost, fetchCategories, searchPosts } from "@/lib/api";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (page: number, size: number, category?: string) =>
    [...postKeys.lists(), { page, size, category }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
  categories: () => [...postKeys.all, "categories"] as const,
  search: (query: string) => [...postKeys.all, "search", query] as const,
};

export function usePostsQuery(page = 0, size = 10, category?: string) {
  return useQuery({
    queryKey: postKeys.list(page, size, category),
    queryFn: () => fetchPosts(page, size, category),
  });
}

export function usePostDetailQuery(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => fetchPost(slug),
    enabled: !!slug,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: postKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10분
  });
}

export function useSearchPostsQuery(query: string) {
  return useQuery({
    queryKey: postKeys.search(query),
    queryFn: () => searchPosts(query),
    enabled: query.length >= 2,
  });
}
