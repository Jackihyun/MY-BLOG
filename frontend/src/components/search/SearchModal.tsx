"use client";

import { useEffect } from "react";
import SearchBar from "./SearchBar";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 sm:pt-[18vh]"
      role="dialog"
      aria-modal="true"
      aria-label="게시글 검색"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl">
        <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-white/10 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-[#111111]/95">
          <SearchBar onClose={onClose} isModal />
        </div>
      </div>
    </div>
  );
}
