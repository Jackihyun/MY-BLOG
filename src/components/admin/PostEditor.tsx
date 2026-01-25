"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createPost, updatePost, fetchPostAdmin, fetchCategories } from "@/lib/api";

const TiptapEditor = dynamic(
  () => import("@/components/editor/TiptapEditor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

interface PostEditorProps {
  slug?: string;
  mode: "create" | "edit";
}

function EditorSkeleton() {
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
      <div className="h-[400px] bg-gray-50 dark:bg-gray-900" />
    </div>
  );
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
  const [editorMode, setEditorMode] = useState<"wysiwyg" | "markdown">("wysiwyg");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // 기존 카테고리 목록 가져오기
    fetchCategories()
      .then(setExistingCategories)
      .catch(console.error);

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
          toast.error("글을 불러오는데 실패했습니다.");
          router.push("/posts");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, mode, slug, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category.trim()) {
      toast.error("제목, 내용, 카테고리는 필수입니다.");
      return;
    }

    if (!token) {
      toast.error("로그인이 필요합니다.");
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
        toast.success("글이 작성되었습니다.");
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
        toast.success("글이 수정되었습니다.");
        router.push(`/posts/${slug}`);
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {mode === "create" ? "새 글 작성" : "글 수정"}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">에디터:</span>
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => setEditorMode("wysiwyg")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                editorMode === "wysiwyg"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              리치 텍스트
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("markdown")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                editorMode === "markdown"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Markdown
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-0 py-3 text-3xl font-bold border-0 border-b-2 border-transparent
                       bg-transparent text-gray-900 dark:text-gray-100
                       placeholder-gray-300 dark:placeholder-gray-600
                       focus:outline-none focus:border-blue-500
                       transition-colors"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 메타 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mode === "create" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Slug (URL)
              </label>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                           bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all"
                placeholder="자동 생성"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              카테고리 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-grow px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                           bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all"
                placeholder="TIL, 개발, 회고 등"
              />
              {existingCategories.length > 0 && (
                <select
                  value={existingCategories.includes(category) ? category : ""}
                  onChange={(e) => {
                    if (e.target.value) setCategory(e.target.value);
                  }}
                  className="w-32 px-2 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                             bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all cursor-pointer"
                >
                  <option value="">선택 안함</option>
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className={mode === "create" ? "" : "md:col-span-2"}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              요약 (선택)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                         bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
              placeholder="글 요약 (목록에 표시됨)"
            />
          </div>
        </div>

        {/* 에디터 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            내용 *
          </label>
          {editorMode === "wysiwyg" ? (
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="이야기를 시작해보세요..."
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         font-mono text-sm leading-relaxed resize-none
                         transition-all"
              placeholder="마크다운으로 내용을 작성하세요..."
            />
          )}
        </div>

        {/* 하단 액션 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full
                                peer-checked:bg-green-500
                                transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                                peer-checked:translate-x-5
                                transition-transform" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                {publish ? "발행됨" : "발행하기"}
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400
                           border border-gray-300 dark:border-gray-600 rounded-xl
                           hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-xl
                           bg-gradient-to-r from-blue-500 to-blue-600
                           hover:from-blue-600 hover:to-blue-700
                           disabled:from-gray-400 disabled:to-gray-500
                           disabled:cursor-not-allowed
                           shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                           transition-all duration-200"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    저장 중...
                  </span>
                ) : mode === "create" ? (
                  "작성하기"
                ) : (
                  "수정하기"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
