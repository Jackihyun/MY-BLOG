"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { CommentResponse, CommentCreateRequest } from "@/types";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: CommentResponse;
  onReply: (parentId: number, data: CommentCreateRequest) => Promise<boolean>;
  onDelete: (commentId: number, password: string) => Promise<boolean>;
  depth?: number;
  isGuestbookStyle?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-zinc-400 to-zinc-600",
    "from-purple-400 to-purple-600",
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-orange-600",
    "from-pink-400 to-rose-600",
    "from-teal-400 to-emerald-600",
    "from-indigo-400 to-indigo-600",
    "from-violet-400 to-violet-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  depth = 0,
  isGuestbookStyle = false,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 본인 확인 로직
  const isAuthor = session?.user?.email && comment.authorEmail === session.user.email;

  const handleReply = async (data: CommentCreateRequest) => {
    const success = await onReply(comment.id, data);
    if (success) {
      setShowReplyForm(false);
    }
    return success;
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("정말 이 댓글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      const success = await onDelete(comment.id, "social-login");
      if (success) {
        toast.success("댓글이 삭제되었습니다.");
        setShowDeleteModal(false);
      }
    } catch (error) {
      toast.error("댓글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const maxDepth = 2;
  const canReply = depth < maxDepth && !comment.isDeleted;

  if (isGuestbookStyle && depth === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(comment.authorName)} flex items-center justify-center text-white font-black text-lg shadow-sm`}>
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-black text-zinc-900 dark:text-zinc-50 truncate">
                {comment.authorName}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              {comment.content}
            </p>
            {!comment.isDeleted && (
              <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-[10px] font-black text-zinc-400 hover:text-indigo-500 uppercase tracking-widest"
                >
                  Reply
                </button>
                {isAuthor && (
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="text-[10px] font-black text-zinc-400 hover:text-rose-500 uppercase tracking-widest"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-zinc-50 dark:border-zinc-900"
            >
              <CommentForm
                onSubmit={handleReply}
                isReply
                buttonText="답글 남기기"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="pl-6 border-l-2 border-zinc-50 dark:border-zinc-900">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-50">{reply.authorName}</span>
                  <span className="text-[9px] text-zinc-400 uppercase">{formatRelativeTime(reply.createdAt)}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm p-8 bg-white dark:bg-[#0d0d0d] rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2 uppercase tracking-tight">Delete Message</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">정말로 이 메시지를 삭제하시겠습니까?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">취소</button>
                <button onClick={handleDelete} className="flex-1 py-3 text-sm font-bold text-white bg-rose-500 rounded-2xl">삭제하기</button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${depth > 0 ? "ml-6 md:ml-10 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800" : ""}`}
    >
      <div
        className={`group relative p-4 rounded-xl transition-all duration-200 ${
          comment.isDeleted
            ? "bg-zinc-100 dark:bg-zinc-800/30"
            : "bg-white dark:bg-[#0a0a0a] hover:shadow-md border border-zinc-100 dark:border-zinc-800"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
              comment.authorName
            )} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
          >
            {comment.authorName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-bold text-sm ${
                  comment.isDeleted
                    ? "text-zinc-400 dark:text-zinc-500"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {comment.authorName}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {depth > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  답글
                </span>
              )}
            </div>

            <p
              className={`mt-2 text-sm leading-relaxed whitespace-pre-wrap ${
                comment.isDeleted
                  ? "text-zinc-400 dark:text-zinc-500 italic"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {comment.content}
            </p>

            {!comment.isDeleted && (
              <div className="flex items-center gap-4 mt-3">
                {canReply && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    {showReplyForm ? "취소" : "답글"}
                  </button>
                )}
                {isAuthor && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    삭제
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 ml-13"
          >
            <CommentForm
              onSubmit={handleReply}
              placeholder="답글을 작성해주세요..."
              buttonText="답글 작성"
              onCancel={() => setShowReplyForm(false)}
              isReply
            />
          </motion.div>
        )}
      </AnimatePresence>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm p-8 bg-white dark:bg-[#0d0d0d] rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800"
          >
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2 uppercase tracking-tight">Delete Comment</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">정말로 이 댓글을 삭제하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">취소</button>
              <button onClick={handleDelete} className="flex-1 py-3 text-sm font-bold text-white bg-rose-500 rounded-2xl">삭제하기</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
