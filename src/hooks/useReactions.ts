"use client";

import { useState, useCallback, useEffect } from "react";
import {
  fetchReactions,
  toggleReaction,
  toggleLike,
  fetchLikeStatus,
  getClientId,
} from "@/lib/api";
import { ReactionResponse } from "@/types";

export function useReactions(slug: string) {
  const [reactions, setReactions] = useState<ReactionResponse>({
    counts: {},
    userReactions: [],
  });
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadReactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const clientId = getClientId();
      const [reactionData, likeData] = await Promise.all([
        fetchReactions(slug, clientId),
        fetchLikeStatus(slug, clientId),
      ]);
      setReactions(reactionData);
      setLiked(likeData.liked);
      setLikeCount(likeData.likeCount);
    } catch (err) {
      console.error("Failed to load reactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  const handleReaction = useCallback(
    async (emoji: string) => {
      try {
        const clientId = getClientId();
        const newReactions = await toggleReaction(slug, { emoji, clientId });
        setReactions(newReactions);
      } catch (err) {
        console.error("Failed to toggle reaction:", err);
      }
    },
    [slug]
  );

  const handleLike = useCallback(async () => {
    try {
      const clientId = getClientId();
      const result = await toggleLike(slug, clientId);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  }, [slug]);

  return {
    reactions,
    liked,
    likeCount,
    isLoading,
    handleReaction,
    handleLike,
  };
}
