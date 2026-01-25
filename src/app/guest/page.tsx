"use client";

import React from "react";
import { motion } from "framer-motion";
import CommentList from "@/components/comments/CommentList";

const Guest: React.FC = () => {
  return (
    <div className="py-12 space-y-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-indigo-50 dark:from-zinc-800 dark:to-indigo-900/20 mb-2">
          <span className="text-3xl">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Guest Book
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          반가워요! 자유롭게 방명록을 작성해주세요 :)
        </p>
      </motion.div>

      {/* Comment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <CommentList slug="guestbook" />
      </motion.div>
    </div>
  );
};

export default Guest;
