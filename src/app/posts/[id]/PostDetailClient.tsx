"use client";

import dynamic from "next/dynamic";
import { PostData } from "@/types";
import AdminButtons from "@/components/admin/AdminButtons";
import ReadingProgress from "@/components/post/ReadingProgress";
import ReadingTime from "@/components/post/ReadingTime";
import { CommentSkeletonList } from "@/components/skeletons/CommentSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

const TableOfContents = dynamic(
  () => import("@/components/post/TableOfContents"),
  { ssr: false }
);

const ReactionBar = dynamic(
  () => import("@/components/reactions/ReactionBar"),
  {
    loading: () => (
      <div className="py-4 border-t border-b border-gray-200 dark:border-gray-700">
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
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
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

      <div>
        <AdminButtons slug={postData.id} />

        <div className="border-b border-gray-400 my-[40px]">
          <p className="text-sm mb-[5px] text-[#989ba0] font-pretendard-regular dark:text-[#8e8f97]">
            {postData.category}
          </p>
          <p className="text-2xl mb-[6px] font-pretendard-semibold text-[#0f1010] dark:text-[#e6e6e6]">
            {postData.title}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm text-[#989ba0] font-pretendard-regular dark:text-[#8e8f97]">
              {postData.date}
            </p>
            <ReadingTime
              minutes={postData.readingTime}
              content={postData.contentHtml}
            />
            {postData.viewCount !== undefined && postData.viewCount > 0 && (
              <span className="text-sm text-[#989ba0] dark:text-[#8e8f97]">
                조회 {postData.viewCount}
              </span>
            )}
          </div>
        </div>

        <article
          data-post-content
          className="prose dark:prose-invert max-w-none text-[#0f1010] font-pretendard-regular dark:text-[#e6e6e6]"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />

        <ReactionBar slug={postData.id} />

        <CommentList slug={postData.id} />
      </div>
    </>
  );
}
