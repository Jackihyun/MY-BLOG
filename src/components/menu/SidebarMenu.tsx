import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecoilState } from "recoil";
import { sidebarState } from "@/store/sidebarState";

const SidebarMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const [, setSidebarOpen] = useRecoilState(sidebarState);

  const closeSidebar = () => {
    setSidebarOpen(false);
    onClose();
  };

  const linkClasses = (path: string) => {
    const baseClasses = "text-black/70 dark:text-white/70";
    const activeClasses = "text-black dark:text-white font-bold";

    return pathname === path ? activeClasses : baseClasses;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        ></div>
      )}
      <div
        className={`fixed top-0 right-0 h-full w-72 shadow-md rounded-md bg-white dark:bg-black/70 z-40 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <nav className="flex flex-col font-semibold items-end pr-14 mt-20 space-y-10">
          <Link
            href="/posts"
            className={linkClasses("/posts")}
            onClick={closeSidebar}
          >
            posts
          </Link>
          <Link
            href="/about"
            className={linkClasses("/about")}
            onClick={closeSidebar}
          >
            about
          </Link>
          <Link
            href="/guest"
            className={linkClasses("/guest")}
            onClick={closeSidebar}
          >
            guest
          </Link>
          <Link
            href="/portfolio"
            className={linkClasses("/portfolio")}
            onClick={closeSidebar}
          >
            portfolio
          </Link>
        </nav>
      </div>
    </>
  );
};

export default SidebarMenu;
