import {
  getPostData,
  getSortedPostsData,
  isIndexablePost,
  isSearchIndexablePost,
} from "@/lib/posts";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetailClient from "./PostDetailClient";
import { toAbsoluteThumbnailUrl } from "@/lib/post-thumbnail";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PostProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
  const postData = await getPostData(params.id);
  if (!isIndexablePost(postData)) {
    return {
      title: "글을 찾을 수 없습니다",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.jackihyun.com";
  const ogUrl = `${siteUrl}/api/og?title=${encodeURIComponent(postData.title)}&category=${encodeURIComponent(postData.category)}`;
  const shareImage = postData.thumbnail
    ? toAbsoluteThumbnailUrl(postData.thumbnail, siteUrl)
    : ogUrl;
  const shouldIndex = isSearchIndexablePost(postData);

  return {
    title: postData.title,
    description: postData.excerpt || postData.title,
    keywords: [postData.category, postData.title, "Jackihyun", "개발 블로그"],
    robots: {
      index: shouldIndex,
      follow: true,
    },
    alternates: {
      canonical: `${siteUrl}/posts/${params.id}`,
    },
    openGraph: {
      title: postData.title,
      description: postData.excerpt || postData.title,
      type: "article",
      url: `${siteUrl}/posts/${params.id}`,
      publishedTime: postData.date,
      modifiedTime: postData.updatedAt || postData.publishedAt || postData.date,
      authors: ["Jackihyun"],
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: postData.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: postData.title,
      description: postData.excerpt || postData.title,
      images: [shareImage],
    },
  };
}

export default async function PostPage({ params }: PostProps) {
  const postData = await getPostData(params.id);
  if (!isIndexablePost(postData)) {
    notFound();
  }
  const allPosts = await getSortedPostsData();
  const currentIndex = allPosts.findIndex((post) => post.slug === params.id);

  const previousPost =
    currentIndex >= 0 && currentIndex + 1 < allPosts.length
      ? allPosts[currentIndex + 1]
      : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: postData.title,
    datePublished: postData.date,
    dateModified: postData.updatedAt || postData.publishedAt || postData.date,
    author: {
      "@type": "Person",
      name: "Jackihyun",
    },
    publisher: {
      "@type": "Organization",
      name: "Jackihyun 개발 블로그",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.jackihyun.com"}/icon.svg`,
      },
    },
    description: postData.excerpt || postData.title,
    image: postData.thumbnail
      ? toAbsoluteThumbnailUrl(
          postData.thumbnail,
          process.env.NEXT_PUBLIC_SITE_URL || "https://blog.jackihyun.com",
        )
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.jackihyun.com"}/posts/${params.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetailClient
        postData={postData}
        previousPost={
          previousPost
            ? {
                slug: previousPost.slug,
                title: previousPost.title,
                date: previousPost.date,
                category: previousPost.category,
              }
            : null
        }
        nextPost={
          nextPost
            ? {
                slug: nextPost.slug,
                title: nextPost.title,
                date: nextPost.date,
                category: nextPost.category,
              }
            : null
        }
      />
    </>
  );
}

export async function generateStaticParams() {
  return [];
}
