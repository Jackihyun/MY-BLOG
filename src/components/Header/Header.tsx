"use client"; // 클라이언트 구성 요소로 선언합니다.

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecoilState } from "recoil";
import { sidebarState } from "@/store/sidebarState";
import DarkModeToggle from "@/components/DarkModeToogle";
import HamburgerMenu from "@/components/button/HamburgerMenu";
import SidebarMenu from "@/components/menu/SidebarMenu";
import LoadingIndicator from "@/components/modal/LoadingIndicator";
import { useRouteChange } from "@/utils/hooks/useRouteChange";

export default function Header() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useRecoilState(sidebarState);
  const isLoading = useRouteChange();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, setIsSidebarOpen]);

  const linkClasses = (path: string) => {
    return pathname === path
      ? "relative group inline-block text-black dark:text-white border-b-0 border-black dark:border-white"
      : "relative group inline-block text-black dark:text-white";
  };

  const spanClasses = (path: string) => {
    return pathname === path
      ? "absolute left-0 bottom-0 w-full h-[2px] bg-black dark:bg-white transition-all duration-300"
      : "absolute left-0 bottom-0 w-0 h-[2px] bg-black dark:bg-white transition-all duration-300 group-hover:w-full";
  };

  return (
    <header className="flex justify-between bg-[#e8e8e8] dark:bg-[#212121] z-100 h-[55px] fixed w-full top-0 items-center px-4 max-w-[720px] place-items-center font-bold">
      {isLoading && <LoadingIndicator />}
      <div className="grid grid-cols-2 font-pretendard-bold">
        <Link href="/" className="relative group w-fit">
          <span className="text-[16px] md:text-[18px] inline-block ">
            Jack&#39;s Blog
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-black dark:bg-white md:transition-all md:duration-300 md:group-hover:w-full"></span>
          </span>
        </Link>
        <nav className="sm:grid sm:grid-cols-4 text-[16px] md:text-[18px] hidden font-pretendard-regualr">
          <Link href="/posts" className={`w-fit ${linkClasses("/posts")}`}>
            posts
            <span className={spanClasses("/posts")}></span>
          </Link>
          <Link href="/about" className={`w-fit ${linkClasses("/about")}`}>
            about
            <span className={spanClasses("/about")}></span>
          </Link>
          <Link href="/guest" className={`w-fit ${linkClasses("/guest")}`}>
            guest
            <span className={spanClasses("/guest")}></span>
          </Link>
          <Link
            href="/portfolio"
            className={`w-fit ${linkClasses("/portfolio")}`}
          >
            <span className={spanClasses("/portfolio")}></span>
            portfolio
          </Link>
        </nav>
      </div>
      <div className="flex gap-2 justify-center items-center">
        <HamburgerMenu isChecked={isSidebarOpen} onToggle={toggleSidebar} />
        <DarkModeToggle />
      </div>
      <SidebarMenu isOpen={isSidebarOpen} onClose={toggleSidebar} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </header>
  );
}
