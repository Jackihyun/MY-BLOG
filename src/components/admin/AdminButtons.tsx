"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/api";
import { useState } from "react";

interface AdminButtonsProps {
  slug: string;
}

export default function AdminButtons({ slug }: AdminButtonsProps) {
  const { isAuthenticated, token, logout } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isAuthenticated) return null;

  const handleEdit = () => {
    router.push(`/admin/posts/${slug}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      if (token) {
        await deletePost(slug, token);
        alert("글이 삭제되었습니다.");
        router.push("/posts");
      }
    } catch (error) {
      alert("삭제에 실패했습니다.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewPost = () => {
    router.push("/admin/posts/new");
  };

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={handleNewPost}
        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        새 글 작성
      </button>
      <button
        onClick={handleEdit}
        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isDeleting ? "삭제 중..." : "삭제"}
      </button>
      <button
        onClick={logout}
        className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors ml-auto"
      >
        로그아웃
      </button>
    </div>
  );
}
