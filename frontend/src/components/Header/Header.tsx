"use client";

import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { sidebarState } from "@/store/sidebarState";
import DarkModeToggle from "@/components/DarkModeToogle";
import HamburgerMenu from "@/components/button/HamburgerMenu";
import SidebarMenu from "@/components/menu/SidebarMenu";
import { searchPosts } from "@/lib/api";
import { PostResponse } from "@/types";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useRecoilState(sidebarState);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, [setIsSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setShowResults(false);
  }, [pathname, setIsSidebarOpen]);

  const shouldSearch = useMemo(() => query.trim().length >= 2, [query]);

  useEffect(() => {
    if (!shouldSearch) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const posts = await searchPosts(query.trim());
        setResults(posts);
      } catch (error) {
        console.error("Header search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, shouldSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current) {
        return;
      }
      if (!searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        if (!query.trim()) {
          setIsSearchExpanded(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setShowResults(false);
      if (!query.trim()) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [query]);

  const handleSearchSelect = (slug: string) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setIsSearchExpanded(false);
    router.push(`/posts/${slug}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 md:px-10">
      <div className="relative w-full max-w-7xl h-[56px] px-6 flex items-center justify-between bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
          aria-label="Home"
        >
          <span className="text-lg md:text-xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            JACK&#39;S
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden min-[850px]:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 text-sm font-semibold"
          aria-label="Main navigation"
        >
          <Link
            href="/posts"
            className={`px-4 py-2 rounded-xl transition-all ${
              pathname === "/posts"
                ? "bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
          >
            Posts
          </Link>
          <Link
            href="/about"
            className={`px-4 py-2 rounded-xl transition-all ${
              pathname === "/about"
                ? "bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
          >
            About
          </Link>
          <Link
            href="/guest"
            className={`px-4 py-2 rounded-xl transition-all ${
              pathname === "/guest"
                ? "bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
          >
            Guest
          </Link>
          <a
            href="https://jackihyun.me"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
          >
            Portfolio
            <svg
              className="w-3 h-3 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1">
          <div className="relative" ref={searchContainerRef}>
            <div
              className={`flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 overflow-hidden transition-all duration-200 ${
                isSearchExpanded ? "w-[220px] sm:w-[280px]" : "w-10"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (isSearchExpanded && !query.trim()) {
                    setIsSearchExpanded(false);
                    return;
                  }
                  setIsSearchExpanded(true);
                  requestAnimationFrame(() => searchInputRef.current?.focus());
                }}
                aria-label="Search"
                className="h-10 w-10 shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onFocus={() => setShowResults(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowResults(true);
                }}
                placeholder="포스트 검색"
                className="h-10 w-full pr-3 text-sm bg-transparent outline-none text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400"
              />
            </div>

            {isSearchExpanded && showResults && shouldSearch && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0a0a0a] shadow-xl z-50">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    {isLoading ? "검색 중..." : "검색 결과가 없습니다."}
                  </div>
                ) : (
                  <ul>
                    {results.map((post) => (
                      <li key={post.slug}>
                        <button
                          type="button"
                          onClick={() => handleSearchSelect(post.slug)}
                          className="w-full px-4 py-3 text-left border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        >
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {post.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {post.category}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <DarkModeToggle />
          <div className="min-[850px]:hidden">
            <HamburgerMenu isChecked={isSidebarOpen} onToggle={toggleSidebar} />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu - outside the header container */}
      <SidebarMenu isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </header>
  );
}
