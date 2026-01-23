"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CommentCreateRequest } from "@/types";

interface CommentFormProps {
  onSubmit: (data: CommentCreateRequest) => Promise<boolean>;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
  isReply?: boolean;
}

export default function CommentForm({
  onSubmit,
  placeholder = "댓글을 작성해주세요...",
  buttonText = "댓글 작성",
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !password.trim() || !content.trim()) {
      toast.error("닉네임, 비밀번호, 내용은 필수입니다.");
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

  const isValid = authorName.trim() && password.trim() && content.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border transition-all duration-300 ${
        isReply
          ? "bg-white dark:bg-[#1f1f1f] border-gray-200 dark:border-gray-700"
          : "bg-gradient-to-br from-white to-gray-50 dark:from-[#1f1f1f] dark:to-[#171717] border-gray-200 dark:border-gray-800"
      } ${
        isFocused
          ? "border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-500/10"
          : "shadow-sm"
      }`}
    >
      <div className="p-4">
        {/* 텍스트 영역 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={isReply ? 2 : 3}
          className="w-full text-sm bg-transparent text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none resize-none"
          disabled={isSubmitting}
        />

        {/* 입력 필드들 */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="relative flex-1 min-w-[100px]">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="닉네임"
              className="w-full px-3 py-2 text-sm rounded-lg
                         bg-gray-100 dark:bg-[#2a2a2a]
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         border border-transparent
                         focus:outline-none focus:border-blue-400 dark:focus:border-blue-500
                         focus:bg-white dark:focus:bg-[#252525]
                         transition-all duration-200"
              disabled={isSubmitting}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 text-xs">*</span>
          </div>
          <div className="relative flex-1 min-w-[100px]">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-3 py-2 text-sm rounded-lg
                         bg-gray-100 dark:bg-[#2a2a2a]
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         border border-transparent
                         focus:outline-none focus:border-blue-400 dark:focus:border-blue-500
                         focus:bg-white dark:focus:bg-[#252525]
                         transition-all duration-200"
              disabled={isSubmitting}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 text-xs">*</span>
          </div>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="이메일 (선택)"
            className="flex-1 min-w-[120px] px-3 py-2 text-sm rounded-lg
                       bg-gray-100 dark:bg-[#2a2a2a]
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-500
                       border border-transparent
                       focus:outline-none focus:border-blue-400 dark:focus:border-blue-500
                       focus:bg-white dark:focus:bg-[#252525]
                       transition-all duration-200"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-[#171717] rounded-b-xl border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400">
          {content.length > 0 && `${content.length}자`}
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                         rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                         transition-all duration-200"
              disabled={isSubmitting}
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg
                       bg-gradient-to-r from-blue-500 to-blue-600
                       hover:from-blue-600 hover:to-blue-700
                       disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700
                       disabled:cursor-not-allowed
                       transform active:scale-95
                       transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                작성 중...
              </span>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
