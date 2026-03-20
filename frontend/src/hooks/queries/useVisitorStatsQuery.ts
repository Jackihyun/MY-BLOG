"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchVisitorStats, fetchVisitorSummary, trackVisitor } from "@/lib/api";
import { VisitTrackRequest } from "@/types";

export const visitorKeys = {
  all: ["visitors"] as const,
  summary: () => [...visitorKeys.all, "summary"] as const,
  stats: () => [...visitorKeys.all, "stats"] as const,
};

export function useVisitorSummaryQuery() {
  return useQuery({
    queryKey: visitorKeys.summary(),
    queryFn: fetchVisitorSummary,
    staleTime: 1000 * 30,
  });
}

export function useVisitorStatsQuery(token?: string | null, enabled = true) {
  return useQuery({
    queryKey: visitorKeys.stats(),
    queryFn: () => fetchVisitorStats(token!),
    staleTime: 1000 * 30,
    enabled: enabled && !!token,
  });
}

export function useTrackVisitorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VisitTrackRequest) => trackVisitor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorKeys.summary() });
      queryClient.invalidateQueries({ queryKey: visitorKeys.stats() });
    },
  });
}
