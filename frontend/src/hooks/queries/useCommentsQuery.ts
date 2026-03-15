"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchComments,
  createComment,
  createReply,
  deleteComment,
} from "@/lib/api";
import { CommentResponse, CommentCreateRequest } from "@/types";

export const commentKeys = {
  all: ["comments"] as const,
  list: (slug: string) => [...commentKeys.all, "list", slug] as const,
};

export function useCommentsQuery(slug: string) {
  return useQuery({
    queryKey: commentKeys.list(slug),
    queryFn: () => fetchComments(slug),
  });
}

export function useAddCommentMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CommentCreateRequest) => createComment(slug, data),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(slug) });

      const previousComments = queryClient.getQueryData<CommentResponse[]>(
        commentKeys.list(slug)
      );

      // 낙관적 업데이트
      if (previousComments) {
        const optimisticComment: CommentResponse = {
          id: Date.now(),
          authorName: newComment.authorName,
          content: newComment.content,
          depth: 0,
          createdAt: new Date().toISOString(),
          isDeleted: false,
          replies: [],
        };
        queryClient.setQueryData<CommentResponse[]>(commentKeys.list(slug), [
          ...previousComments,
          optimisticComment,
        ]);
      }

      return { previousComments };
    },
    onError: (_err, _newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(slug),
          context.previousComments
        );
      }
      toast.error("댓글 작성에 실패했습니다.");
    },
    onSuccess: () => {
      toast.success("댓글이 작성되었습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(slug) });
    },
  });
}

export function useAddReplyMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      data,
    }: {
      parentId: number;
      data: CommentCreateRequest;
    }) => createReply(parentId, data),
    onSuccess: () => {
      toast.success("답글이 작성되었습니다.");
      queryClient.invalidateQueries({ queryKey: commentKeys.list(slug) });
    },
    onError: () => {
      toast.error("답글 작성에 실패했습니다.");
    },
  });
}

export function useDeleteCommentMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      password,
    }: {
      commentId: number;
      password: string;
    }) => deleteComment(commentId, password),
    onSuccess: () => {
      toast.success("댓글이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: commentKeys.list(slug) });
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다. 비밀번호를 확인해주세요.");
    },
  });
}

export function useCommentCount(comments: CommentResponse[] | undefined): number {
  if (!comments) return 0;

  const countReplies = (items: CommentResponse[]): number => {
    return items.reduce((acc, comment) => {
      return acc + 1 + (comment.replies ? countReplies(comment.replies) : 0);
    }, 0);
  };

  return countReplies(comments);
}
