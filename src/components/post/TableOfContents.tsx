"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3");

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

    const headings = contentDiv.querySelectorAll("h1, h2, h3");
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
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="hidden xl:block fixed left-[calc(50%+400px)] top-[120px] w-[240px] max-h-[calc(100vh-200px)] overflow-y-auto
                    p-6 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-xl
                    border border-zinc-100 dark:border-zinc-800 shadow-sm">
      <h3 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-4">
        Contents
      </h3>
      <ul className="space-y-1 text-sm font-semibold">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <button
              onClick={() => handleClick(item.id)}
              className={`text-left w-full truncate transition-all duration-200 py-1.5 px-3 rounded-xl ${
                activeId === item.id
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
