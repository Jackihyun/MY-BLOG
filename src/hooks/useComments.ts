"use client";

import { useState, useCallback } from "react";
import {
  fetchComments,
  createComment,
  createReply,
  deleteComment,
} from "@/lib/api";
import { CommentResponse, CommentCreateRequest } from "@/types";

export function useComments(slug: string) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchComments(slug);
      setComments(data);
    } catch (err) {
      setError("댓글을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const addComment = useCallback(
    async (data: CommentCreateRequest): Promise<boolean> => {
      try {
        await createComment(slug, data);
        await loadComments();
        return true;
      } catch (err) {
        setError("댓글 작성에 실패했습니다.");
        console.error(err);
        return false;
      }
    },
    [slug, loadComments]
  );

  const addReply = useCallback(
    async (parentId: number, data: CommentCreateRequest): Promise<boolean> => {
      try {
        await createReply(parentId, data);
        await loadComments();
        return true;
      } catch (err) {
        setError("답글 작성에 실패했습니다.");
        console.error(err);
        return false;
      }
    },
    [loadComments]
  );

  const removeComment = useCallback(
    async (commentId: number, password: string): Promise<boolean> => {
      try {
        await deleteComment(commentId, password);
        await loadComments();
        return true;
      } catch (err) {
        setError("댓글 삭제에 실패했습니다. 비밀번호를 확인해주세요.");
        console.error(err);
        return false;
      }
    },
    [loadComments]
  );

  const getTotalCount = useCallback((): number => {
    const countReplies = (items: CommentResponse[]): number => {
      return items.reduce((acc, comment) => {
        return acc + 1 + (comment.replies ? countReplies(comment.replies) : 0);
      }, 0);
    };
    return countReplies(comments);
  }, [comments]);

  return {
    comments,
    isLoading,
    error,
    loadComments,
    addComment,
    addReply,
    removeComment,
    getTotalCount,
  };
}
