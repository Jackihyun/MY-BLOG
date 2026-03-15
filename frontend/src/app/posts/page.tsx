import { getSortedPostsData, PostData } from "@/lib/posts";
import PostsList from "@/components/posts/PostList";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 10; // ISR (Incremental Static Regeneration) 옵션

export const metadata: Metadata = {
  title: "Posts",
  description:
    "Jack의 개발 블로그 게시글 목록입니다. 프론트엔드, 백엔드, AI 등 다양한 기술 주제를 다룹니다.",
  openGraph: {
    title: "Posts | Jack's Blog",
    description:
      "Jack의 개발 블로그 게시글 목록입니다. 프론트엔드, 백엔드, AI 등 다양한 기술 주제를 다룹니다.",
    type: "website",
  },
};

export default async function PostsPage() {
  const allPostsData: PostData[] = await getSortedPostsData();

  return (
    <div className="py-8">
      <Suspense fallback={<div className="py-8 text-sm text-zinc-500">게시글 목록을 불러오는 중...</div>}>
        <PostsList allPostsData={allPostsData} />
      </Suspense>
    </div>
  );
}
