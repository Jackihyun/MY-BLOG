"use client";

import { useState, useMemo, memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PostData } from "@/lib/posts";
import { useAuth } from "@/hooks/useAuth";

function PostsList({
  allPostsData,
}: {
  allPostsData: PostData[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { isAuthenticated } = useAuth();

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") {
      return allPostsData;
    }
    return allPostsData.filter((post) => post.category === selectedCategory);
  }, [selectedCategory, allPostsData]);

  const categories = useMemo(() => {
    return Array.from(new Set(allPostsData.map((post) => post.category)));
  }, [allPostsData]);

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Posts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filteredPosts.length}개의 글
          </p>
        </div>
        {isAuthenticated && (
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-5 py-2.5
                       bg-gradient-to-r from-blue-500 to-blue-600
                       hover:from-blue-600 hover:to-blue-700
                       text-white font-medium rounded-xl
                       shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                       transition-all duration-200 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            글쓰기
          </Link>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            selectedCategory === "All"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
          onClick={() => setSelectedCategory("All")}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 포스트 목록 */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              아직 작성된 글이 없습니다
            </p>
          </div>
        ) : (
          filteredPosts.map(({ id, date, title, contentHtml, category }, index) => (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/posts/${id}`}>
                <div
                  className="group p-5 bg-white dark:bg-[#1f1f1f] rounded-2xl border border-gray-100 dark:border-gray-800
                             transition-all duration-300 ease-out
                             hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20
                             hover:border-blue-200 dark:hover:border-blue-800
                             hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {title}
                      </h2>
                      <div
                        className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {category}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {date}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(PostsList);
