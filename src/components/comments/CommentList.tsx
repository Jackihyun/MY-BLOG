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
  const isGuestbook = slug === "guestbook";

  if (isLoading) {
    return (
      <section className="mt-12 pt-12 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
            {isGuestbook ? "Guestbook" : "Comments"}
          </h2>
          <div className="w-8 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <CommentSkeletonList count={3} />
      </section>
    );
  }

  return (
    <section className="mt-12 pt-12 border-t border-zinc-100 dark:border-zinc-800/50">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
          {isGuestbook ? "Guestbook" : "Comments"}
        </h2>
        {totalCount > 0 && (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {totalCount}
          </span>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* 댓글/방명록 목록 */}
      <div className={isGuestbook ? "mb-12" : "mb-12"}>
        {comments.length === 0 ? (
          <div className="py-16 px-6 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 mb-4">
              <svg className="w-6 h-6 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold">
              {isGuestbook ? "첫 번째 방명록을 남겨주세요!" : "아직 댓글이 없습니다"}
            </p>
          </div>
        ) : (
          <div className={isGuestbook ? "grid gap-4 sm:grid-cols-2 mb-12" : "space-y-4 mb-12"}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={addReply}
                onDelete={removeComment}
                isGuestbookStyle={isGuestbook}
              />
            ))}
          </div>
        )}
      </div>

      {/* 댓글/방명록 작성 폼 (항상 아래에 위치) */}
      <div className="bg-zinc-50/50 dark:bg-zinc-900/30 p-6 md:p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mb-4 uppercase tracking-wider">
          {isGuestbook ? "Leave a message" : "Leave a comment"}
        </h3>
        <CommentForm
          onSubmit={addComment}
          placeholder={isGuestbook ? "따뜻한 한마디를 남겨주세요..." : "이 글에 대한 생각을 공유해주세요..."}
          buttonText={isGuestbook ? "방명록 남기기" : "댓글 작성"}
        />
      </div>
    </section>
  );
}
