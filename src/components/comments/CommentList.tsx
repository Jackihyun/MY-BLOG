"use client";

import { useEffect } from "react";
import { useComments } from "@/hooks/useComments";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentListProps {
  slug: string;
}

export default function CommentList({ slug }: CommentListProps) {
  const {
    comments,
    isLoading,
    error,
    loadComments,
    addComment,
    addReply,
    removeComment,
    getTotalCount,
  } = useComments(slug);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          댓글
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        댓글 {getTotalCount() > 0 && `(${getTotalCount()})`}
      </h2>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      <div className="mb-6">
        <CommentForm
          onSubmit={addComment}
          placeholder="댓글을 작성해주세요..."
          buttonText="댓글 작성"
        />
      </div>

      {comments.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={addReply}
              onDelete={removeComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
