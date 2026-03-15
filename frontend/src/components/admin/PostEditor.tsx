"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  createPost,
  updatePost,
  fetchPostAdmin,
  fetchPost,
  fetchCategories,
  fetchCategoryTree,
  fetchLegacyPost,
  uploadImage,
  isUploadedImageUrl,
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
  const [thumbnail, setThumbnail] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLegacySource, setIsLegacySource] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"published" | "draft">("published");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [categoryTreeNodes, setCategoryTreeNodes] = useState<{ id: string; name: string }[]>([]);
  const defaultCategories = ["TIL", "개발", "회고", "트러블슈팅", "일상"];
  const enableLegacyFilePosts =
    process.env.NEXT_PUBLIC_ENABLE_LEGACY_FILE_POSTS === "true";
  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  const normalizeThumbnailUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("/api/uploads/")) return trimmed;
    if (trimmed.startsWith("/uploads/")) return `/api${trimmed}`;

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.pathname.startsWith("/api/uploads/")) {
          return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
        if (parsed.pathname.startsWith("/uploads/")) {
          return `/api${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  };
  const toDatetimeLocalValue = (value?: string | null) => {
    if (!value) return "";

    const normalized = value.trim();
    if (!normalized) return "";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) return normalized;

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return "";

    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    const hh = String(parsed.getHours()).padStart(2, "0");
    const mi = String(parsed.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };
  const toApiPublishedAt = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? `${trimmed}:00` : undefined;
  };
  
  const categoryOptions = Array.from(
    new Set([
      ...categoryTreeNodes.map(node => node.name),
      ...existingCategories,
      ...defaultCategories,
      ...(category ? [category] : [])
    ])
  );

  const categoryDisplayOptions = Array.from(
    new Set([
      ...categoryTreeNodes.map(node => node.name),
      ...existingCategories,
      ...defaultCategories,
    ])
  );

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
      .then((categories) => {
        setExistingCategories(Array.from(new Set(categories.map((cat) => cat.trim()).filter(Boolean))));
      })
      .catch(console.error);

    // 카테고리 트리 정보 가져오기 (모든 정의된 카테고리 포함)
    fetchCategoryTree()
      .then((tree) => {
        if (tree && tree.nodes) {
          setCategoryTreeNodes(tree.nodes.map(node => ({ id: node.id, name: node.name })));
        }
      })
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
          setThumbnail(normalizeThumbnailUrl(post.thumbnail || ""));
          setPublishedAt(toDatetimeLocalValue(post.publishedAt));
          setPublishStatus(post.isPublished ? "published" : "draft");
          setIsLegacySource(false);
        })
        .catch(async (error) => {
          if (!slug) {
            throw error;
          }

          if (!enableLegacyFilePosts) {
            throw error;
          }

          try {
            const legacyPost = await fetchLegacyPost(slug);
            setTitle(legacyPost.title);
            setContent(legacyPost.contentHtml);
            setCategory(legacyPost.category);
            setPublishedAt("");
            setPublishStatus("draft");
            setIsLegacySource(true);
            toast.info("레거시 파일 글을 불러왔습니다. 저장하면 DB로 마이그레이션됩니다.");
          } catch (legacyError) {
            console.error("Failed to load post:", error, legacyError);
            toast.error("기존 글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
            router.push("/posts");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, mode, slug, token, router, enableLegacyFilePosts]);

  const addCategoryOption = (nextCategory: string) => {
    const normalized = nextCategory.trim();
    if (!normalized) return;

    setCategory(normalized);
    setExistingCategories((prev) =>
      prev.includes(normalized) ? prev : [...prev, normalized]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file, token);
      setThumbnail(normalizeThumbnailUrl(imageUrl));
      toast.success("이미지가 업로드되었습니다.");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

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
      const normalizedThumbnail = normalizeThumbnailUrl(thumbnail);
      const nextPublishedAt = toApiPublishedAt(publishedAt);

      if (mode === "create") {
        await createPost(
          {
            title,
            content,
            category,
            thumbnail: normalizedThumbnail || undefined,
            excerpt: excerpt || undefined,
            slug: customSlug || undefined,
            publish: true,
            publishedAt: nextPublishedAt,
          },
          token
        );
        setPublishStatus("published");
        setIsLegacySource(false);
        toast.success("글이 저장되고 발행되었습니다.");
        router.push("/posts");
      } else if (slug) {
        const payload = {
          title,
          content,
          category,
          thumbnail: normalizedThumbnail || undefined,
          excerpt: excerpt || undefined,
          publish: true,
          publishedAt: nextPublishedAt,
        };

        if (isLegacySource) {
          await createPost(
            {
              ...payload,
              slug,
            },
            token
          );
        } else {
          try {
            await updatePost(slug, payload, token);
          } catch (error: unknown) {
            const status =
              typeof error === "object" && error !== null && "status" in error
                ? (error as { status?: number }).status
                : undefined;

            if (status !== 404) {
              throw error;
            }

            await createPost(
              {
                ...payload,
                slug,
              },
              token
            );
            setIsLegacySource(true);
          }
        }

        setPublishStatus("published");
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

      <div
        className={`mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          publishStatus === "published"
            ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
            : "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-current" />
        {publishStatus === "published" ? "발행 상태" : "임시 상태"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {mode === "create" && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(normalizeSlug(e.target.value))}
                  onBlur={() => setCustomSlug((prev) => normalizeSlug(prev))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                             bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all"
                  placeholder="자동 생성"
                />
              </div>
            )}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                카테고리 *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setIsCategoryDropdownOpen(true);
                  }}
                  onFocus={() => setIsCategoryDropdownOpen(true)}
                  onBlur={() => {
                    // 드롭다운 클릭을 처리하기 위해 약간의 지연 후 닫기
                    setTimeout(() => setIsCategoryDropdownOpen(false), 200);
                    addCategoryOption(category);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCategoryOption(category);
                      setIsCategoryDropdownOpen(false);
                    }
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                              bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                              transition-all"
                  placeholder="카테고리를 선택하거나 새로 입력하세요"
                />
                {isCategoryDropdownOpen && categoryDisplayOptions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] shadow-xl">
                    {categoryDisplayOptions
                      .filter(cat => cat.toLowerCase().includes(category.toLowerCase()))
                      .map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoryDisplayOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => addCategoryOption(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      category === cat
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                발행 일시
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                           bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all"
              />
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                비워두면 현재 시각으로 발행됩니다.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                요약
              </label>
              <p className="px-3 py-2.5 text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1e1e1e]">
                본문에서 자동 생성됩니다. (제목/코드 블록 제외, 최대 160자)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              썸네일 이미지
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  onBlur={() => setThumbnail((prev) => normalizeThumbnailUrl(prev))}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                             bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all"
                  placeholder="이미지 URL을 입력하거나 직접 업로드하세요"
                />
                <label className="shrink-0 cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                </label>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] flex items-center justify-center group">
                {thumbnail ? (
                  <>
                    <Image
                      src={thumbnail}
                      alt="Thumbnail preview"
                      fill
                      unoptimized={isUploadedImageUrl(thumbnail)}
                      className="object-cover"
                      onError={() => toast.error("썸네일 URL을 확인해주세요.")}
                    />
                    <button
                      type="button"
                      onClick={() => setThumbnail("")}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-400">썸네일 미리보기</p>
                  </div>
                )}
              </div>
            </div>
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
