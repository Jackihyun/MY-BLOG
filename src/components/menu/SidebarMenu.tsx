import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();

  const linkClasses = (path: string) => {
    const baseClasses = "text-black/70 dark:text-white/70";
    const activeClasses = "text-black dark:text-white font-bold";

    return pathname === path ? activeClasses : baseClasses;
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 shadow-md rounded-md bg-white dark:bg-black/70 z-40 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <nav className="flex flex-col font-semibold items-end pr-14 mt-20 space-y-10">
        <Link href="/posts" className={linkClasses("/posts")} onClick={onClose}>
          posts
        </Link>
        <Link href="/about" className={linkClasses("/about")} onClick={onClose}>
          about
        </Link>
        <Link href="/guest" className={linkClasses("/guest")} onClick={onClose}>
          guest
        </Link>
        <Link
          href="/portfolio"
          className={linkClasses("/portfolio")}
          onClick={onClose}
        >
          portfolio
        </Link>
        {/* 다크 모드 버튼을 여기에 추가할 수 있습니다. */}
      </nav>
    </div>
  );
};

export default SidebarMenu;
