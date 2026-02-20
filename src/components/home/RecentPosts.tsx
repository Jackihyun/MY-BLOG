"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PostData } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPostPreview } from "@/lib/utils";

interface RecentPostsProps {
  posts: PostData[];
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            최근 글
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            최근에 작성한 포스트입니다
          </p>
        </div>
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          전체 보기
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-center">
              아직 작성된 글이 없습니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/posts/${post.id}`}>
                <Card className="h-full group hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 cursor-pointer overflow-hidden border-zinc-100 dark:border-zinc-800 dark:bg-[#0a0a0a]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                        {post.date}
                      </span>
                    </div>
                    <CardTitle className="text-xl mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription
                      className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium"
                    >
                      {getPostPreview(post.excerpt, post.contentHtml, 120)}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-6 text-indigo-600 dark:text-indigo-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      읽어보기
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
