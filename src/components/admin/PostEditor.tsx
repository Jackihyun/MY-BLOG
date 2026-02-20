"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  createPost,
  updatePost,
  fetchPostAdmin,
  fetchPost,
  fetchCategories,
} from "@/lib/api";

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
  const [customSlug, setCustomSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const defaultCategories = ["TIL", "개발", "회고", "트러블슈팅", "일상"];
  const mergedCategories = [
    ...existingCategories,
    ...defaultCategories.filter((cat) => !existingCategories.includes(cat)),
  ];
  const categoryOptions =
    category && !mergedCategories.includes(category)
      ? [category, ...mergedCategories]
      : mergedCategories;

  const createExcerptFromContent = (html: string) => {
    const excerptLimit = 160;
    const container = document.createElement("div");
    container.innerHTML = html;

    container
      .querySelectorAll("h1, h2, h3, h4, h5, h6, pre, code, blockquote, hr")
      .forEach((node) => node.remove());

    const plainText = (container.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!plainText) {
      return "";
    }

    if (plainText.length <= excerptLimit) {
      return plainText;
    }

    return `${plainText.slice(0, excerptLimit).trimEnd()}...`;
  };

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
        .catch(async (adminError) => {
          console.warn("Admin fetch failed, fallback to public post:", adminError);
          return fetchPost(slug);
        })
        .then((post) => {
          setTitle(post.title);
          setContent(post.contentHtml || post.content);
          setCategory(post.category);
        })
        .catch((error) => {
          console.error("Failed to load post:", error);
          toast.error("기존 글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
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
      const excerpt = createExcerptFromContent(content);

      if (mode === "create") {
        const newPost = await createPost(
          {
            title,
            content,
            category,
            excerpt: excerpt || undefined,
            slug: customSlug || undefined,
            publish: true,
          },
          token
        );
        toast.success("글이 저장되고 발행되었습니다.");
        router.push("/posts");
      } else if (slug) {
        await updatePost(
          slug,
          {
            title,
            content,
            category,
            excerpt: excerpt || undefined,
            publish: true,
          },
          token
        );
        toast.success("글이 수정되고 발행되었습니다.");
        router.push("/posts");
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Notion 스타일 에디터
        </p>
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                         bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all cursor-pointer"
            >
              <option value="" disabled>
                카테고리를 선택하세요
              </option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className={mode === "create" ? "" : "md:col-span-2"}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              요약
            </label>
            <p className="px-3 py-2.5 text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1e1e1e]">
              본문에서 자동 생성됩니다. (제목/코드 블록 제외, 최대 160자)
            </p>
          </div>
        </div>

        {/* 에디터 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            내용 *
          </label>
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="이야기를 시작해보세요..."
          />
        </div>

        {/* 하단 액션 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              저장하면 바로 발행됩니다.
            </p>

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
                    저장 및 발행 중...
                  </span>
                ) : "저장 및 발행"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
