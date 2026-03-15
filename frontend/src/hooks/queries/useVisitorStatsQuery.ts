"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchVisitorStats, trackVisitor } from "@/lib/api";

export const visitorKeys = {
  all: ["visitors"] as const,
  stats: () => [...visitorKeys.all, "stats"] as const,
};

export function useVisitorStatsQuery() {
  return useQuery({
    queryKey: visitorKeys.stats(),
    queryFn: fetchVisitorStats,
    staleTime: 1000 * 30,
  });
}

export function useTrackVisitorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => trackVisitor(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorKeys.stats() });
    },
  });
}
