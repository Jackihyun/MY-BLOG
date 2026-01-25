"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { CommentCreateRequest } from "@/types";
import AuthModal from "@/components/modal/AuthModal";

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
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      authorName: session.user?.name || "익명",
      authorEmail: session.user?.email || undefined,
      password: "social-login", // 소셜 로그인 시 임시 비밀번호
      content: content.trim(),
    });

    if (success) {
      setContent("");
      onCancel?.();
    }
    setIsSubmitting(false);
  };

  const handleTextAreaClick = () => {
    if (!session) {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <form
        onSubmit={handleSubmit}
        className={`rounded-xl border transition-all duration-300 ${
          isReply
            ? "bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800"
            : "bg-gradient-to-br from-white to-zinc-50 dark:from-[#0a0a0a] dark:to-[#050505] border-zinc-200 dark:border-zinc-800"
        } ${
          isFocused
            ? "border-indigo-400 dark:border-indigo-500 shadow-lg shadow-indigo-500/10"
            : "shadow-sm"
        }`}
      >
        <div className="p-4">
          {/* 텍스트 영역 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => {
              if (!session) {
                setIsAuthModalOpen(true);
              } else {
                setIsFocused(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            onClick={handleTextAreaClick}
            placeholder={session ? placeholder : "로그인 후 댓글을 남겨보세요..."}
            rows={isReply ? 2 : 3}
            className="w-full text-sm bg-transparent text-zinc-900 dark:text-zinc-100
                       placeholder-zinc-400 dark:placeholder-zinc-500
                       focus:outline-none resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-xl border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {session?.user?.image && (
              <div className="relative w-7 h-7 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm">
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || ""} 
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xs text-zinc-500 font-bold">
              {session ? `${session.user?.name}님으로 작성 중` : "로그인이 필요합니다"}
            </span>
          </div>
          
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200
                           rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800
                           transition-all duration-200"
                disabled={isSubmitting}
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2 text-sm font-bold text-white rounded-lg
                         bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900
                         hover:opacity-90
                         disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600
                         disabled:cursor-not-allowed
                         transform active:scale-95
                         transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "작성 중..." : buttonText}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
