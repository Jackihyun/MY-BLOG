import { getSortedPostsData, PostData } from "@/lib/posts";
import PostsList from "@/components/posts/PostList";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "개발 글",
  description:
    "Jackihyun이 정리한 프론트엔드, React, Next.js, JavaScript 개발 글 모음입니다.",
  alternates: {
    canonical: "/posts",
  },
  openGraph: {
    title: "개발 글 | Jackihyun 개발 블로그",
    description:
      "Jackihyun이 정리한 프론트엔드, React, Next.js, JavaScript 개발 글 모음입니다.",
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
