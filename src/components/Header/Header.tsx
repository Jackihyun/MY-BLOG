import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between z-100 h-[60px] fixed w-full top-0 left-0 items-center px-4 md:px-10">
      <Link href="/">Jack&#39;s Blog</Link>
      <nav className="grid grid-cols-4 text-[14px] md:text-[18px]">
        <Link href="/posts" className="w-fit hover:text-gray-600">
          posts
        </Link>
        <Link href="/about" className="w-fit hover:text-gray-600">
          about
        </Link>
        <Link href="/guest" className="w-fit hover:text-gray-600">
          guest
        </Link>
        <Link href="/portfolio" className="w-fit hover:text-gray-600">
          portfolio
        </Link>
      </nav>
    </header>
  );
}
