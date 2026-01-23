"use client";

import { useEffect } from "react";
import { useComments } from "@/hooks/useComments";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { CommentSkeletonList } from "../skeletons/CommentSkeleton";

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

  const totalCount = getTotalCount();

  if (isLoading) {
    return (
      <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            댓글
          </h2>
          <div className="w-8 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        <CommentSkeletonList count={3} />
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          댓글
        </h2>
        {totalCount > 0 && (
          <span className="px-2.5 py-1 text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {totalCount}
          </span>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <div className="mb-8">
        <CommentForm
          onSubmit={addComment}
          placeholder="이 글에 대한 생각을 공유해주세요..."
          buttonText="댓글 작성"
        />
      </div>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            아직 댓글이 없습니다
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            첫 번째 댓글을 남겨보세요!
          </p>
        </div>
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
    </section>
  );
}
