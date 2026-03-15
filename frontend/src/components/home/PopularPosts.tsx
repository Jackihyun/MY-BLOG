"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PostData } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPostPreview } from "@/lib/utils";
import { isUploadedImageUrl } from "@/lib/api";

interface PopularPostsProps {
  posts: PostData[];
}

export default function PopularPosts({ posts }: PopularPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.37-.78-.75-.55C9.29 3.51 6 7.02 6 11.11c0 3.42 2.72 5.66 2.1 8.83-.14.71.24 1.44.97 1.44h6.95c.12 0 .26-.02.38-.08.68-.33.76-1.32.35-1.81-.88-1.06-1.02-2.23-.64-3.35.94-2.73 3.64-1.15 3.37-3.79z" />
            </svg>
            인기 글
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            조회수가 높은 포스트입니다
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/posts/${post.slug}`}>
              <Card className="h-full group hover:shadow-2xl hover:border-amber-200 dark:hover:border-amber-800/50 transition-all duration-500 cursor-pointer overflow-hidden border-zinc-100 dark:border-zinc-800 dark:bg-[#0a0a0a] flex flex-col">
                {post.thumbnail ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      unoptimized={isUploadedImageUrl(post.thumbnail)}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-xs font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount?.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-950/20 transition-colors">
                    <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700 group-hover:text-amber-200 dark:group-hover:text-amber-800/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-none px-2 py-0">
                      {post.category}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2 text-zinc-900 dark:text-zinc-100">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {getPostPreview(post.excerpt, post.contentHtml, 80)}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {post.readingTime} min read
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
