"use client"; // 클라이언트 구성 요소로 선언합니다.

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const linkClasses = (path: string) => {
    return pathname === path
      ? "relative group text-black dark:text-white after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-black dark:after:bg-white after:transition-all after:duration-300"
      : "relative group text-black dark:text-white hover:after:content-[''] hover:after:absolute hover:after:left-0 hover:after:bottom-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-black dark:hover:after:bg-white hover:after:transition-all hover:after:duration-300";
  };

  return (
    <header className="flex justify-between bg-[#e8e8e8] dark:bg-[#212121] z-100 h-[60px] fixed w-full top-0 left-0 items-center px-4 md:px-10 font-bold">
      <Link href="/" className="relative group">
        <span className="text-[14px] md:text-[18px] inline-block">
          Jack&#39;s Blog
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-black dark:bg-white transition-all duration-300 group-hover:w-full"></span>
        </span>
      </Link>
      <nav className="grid grid-cols-4 text-[14px] md:text-[18px]">
        <Link href="/posts" className={`w-fit ${linkClasses("/posts")}`}>
          posts
        </Link>
        <Link href="/about" className={`w-fit ${linkClasses("/about")}`}>
          about
        </Link>
        <Link href="/guest" className={`w-fit ${linkClasses("/guest")}`}>
          guest
        </Link>
        <Link
          href="/portfolio"
          className={`w-fit ${linkClasses("/portfolio")}`}
        >
          portfolio
        </Link>
      </nav>
    </header>
  );
}
