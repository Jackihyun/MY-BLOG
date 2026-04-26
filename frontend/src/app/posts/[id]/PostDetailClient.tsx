"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PostData } from "@/types";
import AdminButtons from "@/components/admin/AdminButtons";
import ReadingProgress from "@/components/post/ReadingProgress";
import ReadingTime from "@/components/post/ReadingTime";
import TableOfContents from "@/components/post/TableOfContents";
import { CommentSkeletonList } from "@/components/skeletons/CommentSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { incrementViewCount } from "@/lib/api";
import { enhanceCodeBlocks } from "@/lib/code-blocks";
import { getPostCategories } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  previousPost: {
    slug: string;
    title: string;
    date: string;
    category: string;
  } | null;
  nextPost: {
    slug: string;
    title: string;
    date: string;
    category: string;
  } | null;
}

export default function PostDetailClient({
  postData,
  previousPost,
  nextPost,
}: PostDetailClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isSharing, setIsSharing] = useState(false);
  const [viewCount, setViewCount] = useState(postData.viewCount ?? 0);

  const contentHtml = useMemo(
    () =>
      postData.contentHtml.replace(
        /<img\b(?![^>]*\bdata-lightbox\b)/gi,
        '<img data-lightbox="true"'
      ),
    [postData.contentHtml]
  );
  const contentMarkup = useMemo(() => ({ __html: contentHtml }), [contentHtml]);

  const contentImages = useMemo(() => {
    const matches = Array.from(
      postData.contentHtml.matchAll(
        /<img[^>]+src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>/gi
      )
    );

    return matches.map((match, index) => ({
      src: match[1],
      alt: match[2] || `${postData.title} 이미지 ${index + 1}`,
    }));
  }, [postData.contentHtml, postData.title]);

  const lightboxImage =
    lightboxIndex !== null ? contentImages[lightboxIndex] ?? null : null;

  const shareUrl = useMemo(() => {
    const fallbackBase =
      process.env.NEXT_PUBLIC_SITE_URL || "https://blog.jackihyun.com";

    if (typeof window !== "undefined") {
      return `${window.location.origin}/posts/${postData.slug}`;
    }

    return `${fallbackBase.replace(/\/$/, "")}/posts/${postData.slug}`;
  }, [postData.slug]);

  const shareText = useMemo(
    () => postData.excerpt || `${postData.category} 글을 읽어보세요.`,
    [postData.category, postData.excerpt]
  );
  const categoryLabels = useMemo(() => getPostCategories(postData), [postData]);

  useEffect(() => {
    if (!lightboxImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
        return;
      }
      if (event.key === "ArrowLeft" && contentImages.length > 1) {
        setLightboxZoom(1);
        setLightboxIndex((current) =>
          current === null
            ? 0
            : (current - 1 + contentImages.length) % contentImages.length
        );
        return;
      }
      if (event.key === "ArrowRight" && contentImages.length > 1) {
        setLightboxZoom(1);
        setLightboxIndex((current) =>
          current === null ? 0 : (current + 1) % contentImages.length
        );
        return;
      }
      if ((event.key === "+" || event.key === "=") && lightboxZoom < 3) {
        event.preventDefault();
        setLightboxZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))));
        return;
      }
      if ((event.key === "-" || event.key === "_") && lightboxZoom > 1) {
        event.preventDefault();
        setLightboxZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));
        return;
      }
      if (event.key === "0") {
        setLightboxZoom(1);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contentImages.length, lightboxImage, lightboxZoom]);

  useEffect(() => {
    if (!lightboxImage) {
      setLightboxZoom(1);
    }
  }, [lightboxImage]);

  useEffect(() => {
    setViewCount(postData.viewCount ?? 0);
  }, [postData.viewCount, postData.slug]);

  useEffect(() => {
    const contentElement = document.querySelector("[data-post-content]");
    if (!contentElement) return;

    enhanceCodeBlocks(
      contentElement,
      (message) => toast.success(message),
      (message) => toast.error(message)
    );
  }, [contentHtml]);

  useEffect(() => {
    const viewStorageKey = `post:viewed:${postData.slug}`;

    if (typeof window === "undefined") {
      return;
    }

    if (window.sessionStorage.getItem(viewStorageKey) === "true") {
      return;
    }

    let isCancelled = false;

    const trackView = async () => {
      try {
        await incrementViewCount(postData.slug);
        if (!isCancelled) {
          setViewCount((current) => current + 1);
          window.sessionStorage.setItem(viewStorageKey, "true");
        }
      } catch (error) {
        console.error("Failed to increment view count:", error);
      }
    };

    trackView();

    return () => {
      isCancelled = true;
    };
  }, [postData.slug]);

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: postData.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("게시글 링크를 복사했습니다.");
        return;
      }

      window.prompt("이 링크를 복사하세요.", shareUrl);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error("Share failed:", error);
      toast.error("공유에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <ReadingProgress />
      <TableOfContents contentHtml={postData.contentHtml} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AdminButtons slug={postData.slug} />

        <header className="max-w-4xl mx-auto py-12 border-b border-zinc-100 dark:border-zinc-800/50 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {categoryLabels.map((category) => (
                <span
                  key={`${postData.slug}-${category}`}
                  className="inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider"
                >
                  {category}
                </span>
              ))}
            </div>
          </motion.div>
          
          <h1 className="text-2xl md:text-4xl lg:text-[2.8rem] font-bold text-zinc-900 dark:text-zinc-50 mb-5 md:mb-6 leading-tight">
            {postData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {postData.date}
            </div>
            
            <div className="flex items-center gap-1.5">
              <ReadingTime
                minutes={postData.readingTime}
                content={postData.contentHtml}
              />
            </div>

            {viewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {viewCount} views
              </div>
            )}

            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs md:text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 hover:text-zinc-900 dark:hover:border-zinc-500 dark:hover:text-zinc-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="게시글 공유"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C9.132 13.82 9.77 14.125 10.5 14.125c.73 0 1.368-.305 1.816-.783m-3.632 0L5.5 16.5m6.816-3.158L18.5 16.5M5.5 16.5a2 2 0 110 4 2 2 0 010-4zm13 0a2 2 0 110 4 2 2 0 010-4zm-6.5-13a2 2 0 110 4 2 2 0 010-4zm0 4v6"
                />
              </svg>
              {isSharing ? "공유 중..." : "공유"}
            </button>
          </div>
        </header>

        <article
          data-post-content
          onClick={(event) => {
            const target = event.target as HTMLElement | null;
            if (!target || target.tagName !== "IMG") return;

            const img = target as HTMLImageElement;
            if (img.closest("a")) return;

            const clickedSrc = img.getAttribute("src") || img.currentSrc || img.src;
            const clickedIndex = contentImages.findIndex(
              (image) => image.src === clickedSrc
            );

            setLightboxZoom(1);
            setLightboxIndex(clickedIndex >= 0 ? clickedIndex : 0);
          }}
          className="prose prose-base md:prose-lg dark:prose-invert max-w-4xl mx-auto w-full overflow-hidden
                     prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50
                     prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-[1.8]
                     prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
                     prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50
                     prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                     prose-img:rounded-2xl prose-img:shadow-xl prose-img:max-w-full prose-img:cursor-zoom-in
                     mb-16"
          dangerouslySetInnerHTML={contentMarkup}
        />

        {lightboxImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="이미지 전체보기"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightboxZoom((current) =>
                    Math.max(1, Number((current - 0.25).toFixed(2)))
                  );
                }}
                className="rounded-full bg-white/10 text-white px-3 py-2 text-sm hover:bg-white/20 transition-colors"
                aria-label="축소"
              >
                -
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightboxZoom(1);
                }}
                className="rounded-full bg-white/10 text-white px-3 py-2 text-sm hover:bg-white/20 transition-colors"
                aria-label="배율 초기화"
              >
                {Math.round(lightboxZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightboxZoom((current) =>
                    Math.min(3, Number((current + 0.25).toFixed(2)))
                  );
                }}
                className="rounded-full bg-white/10 text-white px-3 py-2 text-sm hover:bg-white/20 transition-colors"
                aria-label="확대"
              >
                +
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightboxIndex(null);
                }}
                className="rounded-full bg-white/10 text-white px-3 py-2 text-sm hover:bg-white/20 transition-colors"
                aria-label="전체보기 닫기"
              >
                닫기
              </button>
            </div>

            {contentImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightboxZoom(1);
                    setLightboxIndex((current) =>
                      current === null
                        ? 0
                        : (current - 1 + contentImages.length) % contentImages.length
                    );
                  }}
                  className="absolute left-3 sm:left-6 rounded-full bg-white/10 text-white px-4 py-3 text-lg hover:bg-white/20 transition-colors"
                  aria-label="이전 이미지"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightboxZoom(1);
                    setLightboxIndex((current) =>
                      current === null ? 0 : (current + 1) % contentImages.length
                    );
                  }}
                  className="absolute right-3 sm:right-6 rounded-full bg-white/10 text-white px-4 py-3 text-lg hover:bg-white/20 transition-colors"
                  aria-label="다음 이미지"
                >
                  →
                </button>
              </>
            )}

            <div
              className="max-h-[88vh] max-w-[92vw] overflow-auto"
              onClick={(event) => event.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className="max-h-[88vh] max-w-[92vw] w-auto h-auto rounded-2xl shadow-2xl object-contain transition-transform duration-200 ease-out origin-center"
                style={{ transform: `scale(${lightboxZoom})` }}
              />
            </div>

            {contentImages.length > 1 && lightboxIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                {lightboxIndex + 1} / {contentImages.length}
              </div>
            )}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-12">
          <ReactionBar slug={postData.slug} />

          {(previousPost || nextPost) && (
            <nav
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              aria-label="이전글 다음글"
            >
              {previousPost ? (
                <Link
                  href={`/posts/${previousPost.slug}`}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    이전글
                  </p>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 mb-3 transition-colors">
                    {previousPost.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {previousPost.category} · {previousPost.date}
                  </p>
                </Link>
              ) : (
                <div className="hidden md:block" />
              )}

              {nextPost ? (
                <Link
                  href={`/posts/${nextPost.slug}`}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors md:text-right"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    다음글
                  </p>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 mb-3 transition-colors">
                    {nextPost.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {nextPost.category} · {nextPost.date}
                  </p>
                </Link>
              ) : (
                <div className="hidden md:block" />
              )}
            </nav>
          )}

          <CommentList slug={postData.slug} />
        </div>
      </motion.div>
    </>
  );
}
