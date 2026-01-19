"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createPost, updatePost, fetchPostAdmin } from "@/lib/api";
import { remark } from "remark";
import html from "remark-html";

interface PostEditorProps {
  slug?: string;
  mode: "create" | "edit";
}

export default function PostEditor({ slug, mode }: PostEditorProps) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [publish, setPublish] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (mode === "edit" && slug && token) {
      setIsLoading(true);
      fetchPostAdmin(slug, token)
        .then((post) => {
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
          setExcerpt(post.excerpt || "");
          setPublish(post.isPublished);
        })
        .catch((error) => {
          console.error("Failed to load post:", error);
          alert("글을 불러오는데 실패했습니다.");
          router.push("/posts");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, mode, slug, token, router]);

  useEffect(() => {
    const updatePreview = async () => {
      if (content) {
        const result = await remark().use(html).process(content);
        setPreview(result.toString());
      } else {
        setPreview("");
      }
    };
    updatePreview();
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category.trim()) {
      alert("제목, 내용, 카테고리는 필수입니다.");
      return;
    }

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsSaving(true);

    try {
      if (mode === "create") {
        const newPost = await createPost(
          {
            title,
            content,
            category,
            excerpt: excerpt || undefined,
            slug: customSlug || undefined,
            publish,
          },
          token
        );
        alert("글이 작성되었습니다.");
        router.push(`/posts/${newPost.slug}`);
      } else if (slug) {
        await updatePost(
          slug,
          {
            title,
            content,
            category,
            excerpt: excerpt || undefined,
            publish,
          },
          token
        );
        alert("글이 수정되었습니다.");
        router.push(`/posts/${slug}`);
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {mode === "create" ? "새 글 작성" : "글 수정"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            제목 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="제목을 입력하세요"
          />
        </div>

        {mode === "create" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug (URL, 비워두면 자동 생성)
            </label>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-awesome-post"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            카테고리 *
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="TIL, 개발, 회고 등"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            요약 (선택)
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="글 요약 (목록에 표시됨)"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              내용 (Markdown) *
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {showPreview ? "편집" : "미리보기"}
            </button>
          </div>

          {showPreview ? (
            <div
              className="w-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                         prose dark:prose-invert max-w-none overflow-auto"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="마크다운으로 내용을 작성하세요..."
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="publish"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
          />
          <label htmlFor="publish" className="text-sm text-gray-700 dark:text-gray-300">
            바로 발행하기
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600
                       rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "저장 중..." : mode === "create" ? "작성하기" : "수정하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
