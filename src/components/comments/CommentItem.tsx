"use client";

import { useState } from "react";
import { CommentResponse, CommentCreateRequest } from "@/types";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: CommentResponse;
  onReply: (parentId: number, data: CommentCreateRequest) => Promise<boolean>;
  onDelete: (commentId: number, password: string) => Promise<boolean>;
  depth?: number;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReply = async (data: CommentCreateRequest) => {
    const success = await onReply(comment.id, data);
    if (success) {
      setShowReplyForm(false);
    }
    return success;
  };

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      alert("비밀번호를 입력해주세요.");
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
    <div className={`${depth > 0 ? "ml-6 md:ml-8" : ""}`}>
      <div
        className={`p-4 rounded-lg ${
          comment.isDeleted
            ? "bg-gray-100 dark:bg-gray-800/50"
            : "bg-gray-50 dark:bg-[#2a2a2a]"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                comment.isDeleted
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {comment.authorName}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {!comment.isDeleted && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            >
              삭제
            </button>
          )}
        </div>

        <p
          className={`text-sm whitespace-pre-wrap ${
            comment.isDeleted
              ? "text-gray-400 dark:text-gray-500 italic"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {comment.content}
        </p>

        {canReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-2 text-xs text-blue-500 hover:text-blue-600"
          >
            {showReplyForm ? "취소" : "답글"}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-2 ml-4">
          <CommentForm
            onSubmit={handleReply}
            placeholder="답글을 작성해주세요..."
            buttonText="답글 작성"
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm mx-4 p-6 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
              댓글 삭제
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              댓글을 삭제하려면 비밀번호를 입력하세요.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
