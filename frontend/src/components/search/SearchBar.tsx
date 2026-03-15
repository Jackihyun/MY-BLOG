"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchPosts } from "@/lib/api";
import { PostResponse } from "@/types";

interface SearchBarProps {
  onClose?: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const posts = await searchPosts(searchQuery);
      setResults(posts);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, debouncedSearch]);

  useEffect(() => {
    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
        onClose?.();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResults(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleSelect = (slug: string) => {
    router.push(`/posts/${slug}`);
    setQuery("");
    setResults([]);
    setShowResults(false);
    onClose?.();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="검색어를 입력하세요... (2글자 이상)"
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pl-10 text-zinc-900
                     focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300
                     dark:border-zinc-700 dark:bg-[#181818] dark:text-zinc-100 dark:focus:border-indigo-700 dark:focus:ring-indigo-950"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
          </div>
        )}
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg max-h-[400px] overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
              {isLoading ? "검색 중..." : "검색 결과가 없습니다."}
            </div>
          ) : (
            <ul>
              {results.map((post) => (
                <li key={post.slug}>
                  <button
                    onClick={() => handleSelect(post.slug)}
                    className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900
                               border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {highlightMatch(post.title, query)}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-indigo-500">
                        {post.category}
                      </span>
                      {post.excerpt && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {post.excerpt.substring(0, 50)}...
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
