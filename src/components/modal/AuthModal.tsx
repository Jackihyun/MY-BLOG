"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X } from "lucide-react";
import Image from "next/image";
import GoogleIcon from "./google.svg";

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
                  <Image src={GoogleIcon} alt="Google" width={20} height={20} />
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
