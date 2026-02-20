"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml: string;
}

export default function TableOfContents({ contentHtml }: TableOfContentsProps) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, "text/html");
    const headings = doc.querySelectorAll("h2");

    const tocItems: TOCItem[] = [];
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName[1]);

      if (text.trim()) {
        tocItems.push({ id, text, level });
      }
    });

    setItems(tocItems);
  }, [contentHtml]);

  useEffect(() => {
    const contentDiv = document.querySelector('[data-post-content]');
    if (!contentDiv) return;

    const headings = contentDiv.querySelectorAll("h2");
    headings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // 헤더 높이 고려
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (items.length === 0) return null;

  return (
    <div 
      className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dash-style Indicator (Always visible) */}
      <div className="flex flex-col gap-2 items-end cursor-pointer py-10">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`h-1 rounded-full transition-all duration-300 ${
              activeId === item.id
                ? "w-8 bg-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-100"
                : "w-4 bg-zinc-500/30 group-hover:bg-zinc-500/60"
            }`}
          />
        ))}
      </div>

      {/* Expanded Menu Panel */}
      <AnimatePresence>
        {isHovered && (
          <motion.nav
            initial={{ x: 20, opacity: 0, scale: 0.95 }}
            animate={{ x: -20, opacity: 1, scale: 1 }}
            exit={{ x: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-full top-0 w-[260px] max-h-[70vh] overflow-y-auto
                       p-5 rounded-[24px] bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 shadow-2xl"
          >
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-2">
                Table of Contents
              </h3>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                  >
                    <button
                      onClick={() => handleClick(item.id)}
                      className={`text-left w-full truncate py-2 px-3 rounded-xl text-[14px] font-medium transition-colors ${
                        activeId === item.id
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
