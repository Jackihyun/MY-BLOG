import { getPostData, getAllPostIds } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from "next";
import PostDetailClient from "./PostDetailClient";

interface PostProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
  const postData = await getPostData(params.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.jackihyun.me";
  const ogUrl = `/api/og?title=${encodeURIComponent(postData.title)}&category=${encodeURIComponent(postData.category)}`;

  return {
    title: `${postData.title} | Jack's Blog`,
    description: postData.excerpt || postData.title,
    alternates: {
      canonical: `${siteUrl}/posts/${params.id}`,
    },
    openGraph: {
      title: postData.title,
      description: postData.excerpt || postData.title,
      type: "article",
      url: `${siteUrl}/posts/${params.id}`,
      publishedTime: postData.date,
      authors: ["Jackihyun"],
      images: [
        {
          url: ogUrl,
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
      images: [ogUrl],
    },
  };
}

export default async function PostPage({ params }: PostProps) {
  const postData = await getPostData(params.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: postData.title,
    datePublished: postData.date,
    dateModified: postData.date,
    author: {
      "@type": "Person",
      name: "Jackihyun",
    },
    publisher: {
      "@type": "Person",
      name: "Jackihyun",
    },
    description: postData.excerpt || postData.title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://jackblog.com"}/posts/${params.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetailClient postData={postData} />
    </>
  );
}

export async function generateStaticParams() {
  const ids = getAllPostIds();
  return ids.map((id) => ({
    id: id.id,
  }));
}
