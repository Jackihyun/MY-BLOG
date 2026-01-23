"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CommentResponse, CommentCreateRequest } from "@/types";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: CommentResponse;
  onReply: (parentId: number, data: CommentCreateRequest) => Promise<boolean>;
  onDelete: (commentId: number, password: string) => Promise<boolean>;
  depth?: number;
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
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-green-400 to-green-600",
    "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600",
    "from-teal-400 to-teal-600",
    "from-indigo-400 to-indigo-600",
    "from-rose-400 to-rose-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReply = async (data: CommentCreateRequest) => {
    const success = await onReply(comment.id, data);
    if (success) {
      setShowReplyForm(false);
    }
    return success;
  };

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    const success = await onDelete(comment.id, deletePassword);
    if (success) {
      setShowDeleteModal(false);
      setDeletePassword("");
    }
    setIsDeleting(false);
  };

  const maxDepth = 2;
  const canReply = depth < maxDepth && !comment.isDeleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${depth > 0 ? "ml-6 md:ml-10 pl-4 border-l-2 border-gray-200 dark:border-gray-700" : ""}`}
    >
      <div
        className={`group relative p-4 rounded-xl transition-all duration-200 ${
          comment.isDeleted
            ? "bg-gray-100 dark:bg-gray-800/30"
            : "bg-white dark:bg-[#1f1f1f] hover:shadow-md border border-gray-100 dark:border-gray-800"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-start gap-3">
          {/* 아바타 */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
              comment.authorName
            )} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
          >
            {comment.authorName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* 작성자 정보 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-semibold text-sm ${
                  comment.isDeleted
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {comment.authorName}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {depth > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  답글
                </span>
              )}
            </div>

            {/* 댓글 내용 */}
            <p
              className={`mt-2 text-sm leading-relaxed whitespace-pre-wrap ${
                comment.isDeleted
                  ? "text-gray-400 dark:text-gray-500 italic"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {comment.content}
            </p>

            {/* 액션 버튼들 */}
            {!comment.isDeleted && (
              <div className="flex items-center gap-4 mt-3">
                {canReply && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    {showReplyForm ? "취소" : "답글"}
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 답글 폼 */}
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

      {/* 대댓글 목록 */}
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

      {/* 삭제 모달 */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletePassword("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm mx-4 p-6 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  댓글 삭제
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                이 댓글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 mb-4 rounded-xl
                           bg-gray-100 dark:bg-[#2a2a2a]
                           text-gray-900 dark:text-gray-100
                           border-2 border-transparent
                           focus:outline-none focus:border-red-400
                           transition-all duration-200"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium
                             text-gray-700 dark:text-gray-300
                             bg-gray-100 dark:bg-gray-800
                             rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700
                             transition-all duration-200"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || !deletePassword.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white
                             bg-gradient-to-r from-red-500 to-red-600
                             hover:from-red-600 hover:to-red-700
                             disabled:from-gray-300 disabled:to-gray-400
                             rounded-xl transition-all duration-200
                             disabled:cursor-not-allowed"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
