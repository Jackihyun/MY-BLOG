"use client";

import { useState } from "react";
import { CommentCreateRequest } from "@/types";

interface CommentFormProps {
  onSubmit: (data: CommentCreateRequest) => Promise<boolean>;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  placeholder = "댓글을 작성해주세요...",
  buttonText = "댓글 작성",
  onCancel,
}: CommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !password.trim() || !content.trim()) {
      alert("닉네임, 비밀번호, 내용은 필수입니다.");
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim() || undefined,
      password,
      content: content.trim(),
    });

    if (success) {
      setAuthorName("");
      setAuthorEmail("");
      setPassword("");
      setContent("");
      onCancel?.();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="닉네임 *"
          className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <input
          type="email"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          placeholder="이메일 (선택)"
          className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 *"
          className="flex-1 min-w-[100px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                   bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        disabled={isSubmitting}
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            disabled={isSubmitting}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !authorName.trim() || !password.trim() || !content.trim()}
          className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "작성 중..." : buttonText}
        </button>
      </div>
    </form>
  );
}
