"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { CommentCreateRequest } from "@/types";
import AuthModal from "@/components/modal/AuthModal";
import SmartImage from "@/components/ui/SmartImage";
import {
  clearAuthReturnState,
  readAuthReturnState,
} from "@/lib/auth-return";

interface CommentFormProps {
  onSubmit: (data: CommentCreateRequest) => Promise<boolean>;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
  isReply?: boolean;
  formId?: string;
}

export default function CommentForm({
  onSubmit,
  placeholder = "댓글을 작성해주세요...",
  buttonText = "댓글 작성",
  onCancel,
  isReply = false,
  formId,
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!session || !formId || typeof window === "undefined") {
      return;
    }

    const returnState = readAuthReturnState();
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (!returnState || returnState.path !== currentPath) {
      return;
    }

    if (returnState.targetId && returnState.targetId !== formId) {
      return;
    }

    const target = document.getElementById(formId);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        textareaRef.current?.focus();
      });
    }

    clearAuthReturnState();
  }, [formId, session]);

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
        returnTargetId={formId}
      />
      <form
        id={formId}
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
        <div className="p-4 md:p-5">
          {/* 텍스트 영역 */}
          <textarea
            ref={textareaRef}
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
            className="min-h-[96px] w-full text-sm md:text-[15px] leading-7 bg-transparent text-zinc-900 dark:text-zinc-100
                       placeholder-zinc-400 dark:placeholder-zinc-500
                       focus:outline-none resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex flex-col gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-xl border-t border-zinc-100 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {session?.user?.image && (
              <div className="relative w-7 h-7 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm">
                <SmartImage
                  src={session.user.image} 
                  alt={session.user.name || "사용자 프로필 이미지"} 
                  fill
                  containerClassName="h-full w-full"
                  className="object-cover"
                />
              </div>
            )}
            <span className="min-w-0 text-xs leading-5 text-zinc-500 font-bold break-all sm:break-words">
              {session ? `${session.user?.name}님으로 작성 중` : "로그인이 필요합니다"}
            </span>
            {session && (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: window.location.pathname })}
                className="shrink-0 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline underline-offset-2"
              >
                로그아웃
              </button>
            )}
          </div>
          
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200
                           rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800
                           transition-all duration-200 sm:w-auto"
                disabled={isSubmitting}
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full px-5 py-2 text-sm font-bold text-white rounded-lg
                         bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900
                         hover:opacity-90
                         disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600
                         disabled:cursor-not-allowed
                         transform active:scale-95
                         transition-all duration-200 shadow-sm hover:shadow-md sm:w-auto"
            >
              {isSubmitting ? "작성 중..." : buttonText}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
