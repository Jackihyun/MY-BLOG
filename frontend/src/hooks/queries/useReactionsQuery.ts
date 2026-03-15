"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchReactions,
  toggleReaction,
  fetchLikeStatus,
  toggleLike,
  getClientId,
} from "@/lib/api";
import { ReactionResponse, LikeResponse } from "@/types";

export const reactionKeys = {
  all: ["reactions"] as const,
  detail: (slug: string) => [...reactionKeys.all, "detail", slug] as const,
  like: (slug: string) => [...reactionKeys.all, "like", slug] as const,
};

export function useReactionsQuery(slug: string) {
  return useQuery({
    queryKey: reactionKeys.detail(slug),
    queryFn: () => {
      const clientId = getClientId();
      return fetchReactions(slug, clientId);
    },
  });
}

export function useLikeStatusQuery(slug: string) {
  return useQuery({
    queryKey: reactionKeys.like(slug),
    queryFn: () => {
      const clientId = getClientId();
      return fetchLikeStatus(slug, clientId);
    },
  });
}

export function useToggleReactionMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emoji: string) => {
      const clientId = getClientId();
      return toggleReaction(slug, { emoji, clientId });
    },
    onMutate: async (emoji) => {
      await queryClient.cancelQueries({ queryKey: reactionKeys.detail(slug) });

      const previousReactions = queryClient.getQueryData<ReactionResponse>(
        reactionKeys.detail(slug)
      );

      // 낙관적 업데이트
      if (previousReactions) {
        const isActive = previousReactions.userReactions.includes(emoji);
        const newCounts = { ...previousReactions.counts };
        const newUserReactions = [...previousReactions.userReactions];

        if (isActive) {
          newCounts[emoji] = (newCounts[emoji] || 1) - 1;
          const idx = newUserReactions.indexOf(emoji);
          if (idx > -1) newUserReactions.splice(idx, 1);
        } else {
          newCounts[emoji] = (newCounts[emoji] || 0) + 1;
          newUserReactions.push(emoji);
        }

        queryClient.setQueryData<ReactionResponse>(reactionKeys.detail(slug), {
          counts: newCounts,
          userReactions: newUserReactions,
        });
      }

      return { previousReactions };
    },
    onError: (_err, _emoji, context) => {
      if (context?.previousReactions) {
        queryClient.setQueryData(
          reactionKeys.detail(slug),
          context.previousReactions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reactionKeys.detail(slug) });
    },
  });
}

export function useToggleLikeMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const clientId = getClientId();
      return toggleLike(slug, clientId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: reactionKeys.like(slug) });

      const previousLike = queryClient.getQueryData<LikeResponse>(
        reactionKeys.like(slug)
      );

      // 낙관적 업데이트
      if (previousLike) {
        queryClient.setQueryData<LikeResponse>(reactionKeys.like(slug), {
          liked: !previousLike.liked,
          likeCount: previousLike.liked
            ? previousLike.likeCount - 1
            : previousLike.likeCount + 1,
        });
      }

      return { previousLike };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLike) {
        queryClient.setQueryData(reactionKeys.like(slug), context.previousLike);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reactionKeys.like(slug) });
    },
  });
}
