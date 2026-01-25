"use client";

import dynamic from "next/dynamic";
import { PostData } from "@/types";
import AdminButtons from "@/components/admin/AdminButtons";
import ReadingProgress from "@/components/post/ReadingProgress";
import ReadingTime from "@/components/post/ReadingTime";
import { CommentSkeletonList } from "@/components/skeletons/CommentSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";

const TableOfContents = dynamic(
  () => import("@/components/post/TableOfContents"),
  { ssr: false }
);

const ReactionBar = dynamic(
  () => import("@/components/reactions/ReactionBar"),
  {
    loading: () => (
      <div className="py-6 border-t border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-8 rounded-full" />
          ))}
        </div>
      </div>
    ),
  }
);

const CommentList = dynamic(
  () => import("@/components/comments/CommentList"),
  {
    loading: () => (
      <div className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800/50">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          댓글
        </h2>
        <CommentSkeletonList count={3} />
      </div>
    ),
  }
);

interface PostDetailClientProps {
  postData: PostData;
}

export default function PostDetailClient({ postData }: PostDetailClientProps) {
  return (
    <>
      <ReadingProgress />
      <TableOfContents contentHtml={postData.contentHtml} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AdminButtons slug={postData.id} />

        <header className="py-12 border-b border-zinc-100 dark:border-zinc-800/50 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">
              {postData.category}
            </span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 leading-tight">
            {postData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {postData.date}
            </div>
            
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <ReadingTime
                minutes={postData.readingTime}
                content={postData.contentHtml}
              />
            </div>

            {postData.viewCount !== undefined && postData.viewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {postData.viewCount} views
              </div>
            )}
          </div>
        </header>

        <article
          data-post-content
          className="prose dark:prose-invert max-w-none w-full overflow-hidden
                     prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50
                     prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
                     prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50
                     prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded
                     prose-img:rounded-2xl prose-img:shadow-lg prose-img:max-w-full
                     mb-16"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />

        <div className="space-y-12">
          <ReactionBar slug={postData.id} />
          <CommentList slug={postData.id} />
        </div>
      </motion.div>
    </>
  );
}
