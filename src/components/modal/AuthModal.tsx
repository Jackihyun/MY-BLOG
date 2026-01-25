"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm mx-4 p-8 bg-white dark:bg-[#0d0d0d] rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Welcome Back!
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                  로그인하고 소중한 댓글을 남겨주세요.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => signIn("google")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 
                             bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 
                             rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                             transition-all active:scale-[0.98] group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.84h2.64c1.55-1.42 2.43-3.52 2.43-6.27z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.64-2.84c-.73.49-1.66.78-2.64.78-2.04 0-3.77-1.38-4.39-3.25H3.17v2.46C5.01 21.32 8.33 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M7.61 15.03c-.16-.49-.25-1-.25-1.53s.09-1.04.25-1.53V9.51H3.17C2.56 10.71 2.21 12.07 2.21 13.5s.35 2.79.96 3.99l4.44-2.46z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.33 1 5.01 2.68 3.17 5.38l4.44 2.46c.62-1.87 2.35-3.25 4.39-3.25z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-zinc-900 dark:text-zinc-50 font-bold">
                    Google 계정으로 로그인
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium pt-2">
                로그인 시 개인정보 처리방침 및 이용약관에 동의하게 됩니다.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
