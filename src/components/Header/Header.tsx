"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecoilState } from "recoil";
import { sidebarState } from "@/store/sidebarState";
import DarkModeToggle from "@/components/DarkModeToogle";
import HamburgerMenu from "@/components/button/HamburgerMenu";
import SidebarMenu from "@/components/menu/SidebarMenu";

export default function Header() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useRecoilState(sidebarState);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, [setIsSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, setIsSidebarOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="w-full max-w-5xl h-[56px] px-6 flex items-center justify-between bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-lg md:text-xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            JACK&#39;S
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden min-[850px]:flex items-center gap-1 text-sm font-semibold">
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
            <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1">
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
