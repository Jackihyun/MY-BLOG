"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCategoryTree, updateCategoryTree } from "@/lib/api";
import { CategoryTreeResponse } from "@/types";

export const categoryTreeKeys = {
  all: ["category-tree"] as const,
  config: () => [...categoryTreeKeys.all, "config"] as const,
};

export function useCategoryTreeQuery() {
  return useQuery({
    queryKey: categoryTreeKeys.config(),
    queryFn: fetchCategoryTree,
    staleTime: 1000 * 60,
  });
}

export function useUpdateCategoryTreeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, token }: { data: CategoryTreeResponse; token: string }) =>
      updateCategoryTree(data, token),
    onSuccess: (data) => {
      queryClient.setQueryData(categoryTreeKeys.config(), data);
    },
  });
}
