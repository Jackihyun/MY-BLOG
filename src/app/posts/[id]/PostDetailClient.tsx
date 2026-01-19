"use client";

import { PostData } from "@/types";
import AdminButtons from "@/components/admin/AdminButtons";
import ReadingProgress from "@/components/post/ReadingProgress";
import ReadingTime from "@/components/post/ReadingTime";
import TableOfContents from "@/components/post/TableOfContents";
import ReactionBar from "@/components/reactions/ReactionBar";
import CommentList from "@/components/comments/CommentList";

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
