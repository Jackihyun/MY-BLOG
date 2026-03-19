"use client";

import React from "react";
import { motion } from "framer-motion";
import CommentList from "@/components/comments/CommentList";
import { useAuth } from "@/hooks/useAuth";
import { useVisitorStatsQuery } from "@/hooks/queries/useVisitorStatsQuery";

const Guest: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const { data: visitorStats } = useVisitorStatsQuery(token, isAuthenticated);

  return (
    <div className="py-12 space-y-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-left space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-indigo-50 dark:from-zinc-800 dark:to-indigo-900/20 mb-2 shadow-sm">
          <span className="text-3xl">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
        </div>
        <p className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-relaxed">
          반가워요! 방문해주셔서 감사합니다.<br />자유롭게 따뜻한 한마디를 남겨주세요 :)
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

      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0a0a0a]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                Visitor Routes
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                관리자 전용 유입 통계
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                어떤 경로와 어디에서 블로그로 들어오는지 한 번에 볼 수 있습니다.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              Admin Only
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Top Sources
              </p>
              <div className="mt-3 space-y-2">
                {(visitorStats?.topSources ?? []).slice(0, 5).map((item) => (
                  <div
                    key={`source-${item.label}`}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm dark:bg-[#0a0a0a]"
                  >
                    <span className="font-medium capitalize text-zinc-700 dark:text-zinc-200">
                      {item.label}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Landing Paths
              </p>
              <div className="mt-3 space-y-2">
                {(visitorStats?.topLandingPaths ?? []).slice(0, 5).map((item) => (
                  <div
                    key={`landing-${item.label}`}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm dark:bg-[#0a0a0a]"
                  >
                    <span className="truncate pr-3 font-mono text-zinc-700 dark:text-zinc-200">
                      {item.label}
                    </span>
                    <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Referrers
              </p>
              <div className="mt-3 space-y-2">
                {(visitorStats?.topReferrers ?? []).slice(0, 5).map((item) => (
                  <div
                    key={`referrer-${item.label}`}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm dark:bg-[#0a0a0a]"
                  >
                    <span className="truncate pr-3 text-zinc-700 dark:text-zinc-200">
                      {item.label}
                    </span>
                    <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Guest;
