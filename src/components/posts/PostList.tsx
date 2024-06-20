"use client"; // 클라이언트 구성 요소로 선언합니다.

import { useState, useEffect } from "react";
import Link from "next/link";
import { PostData } from "@/lib/posts";

export default function PostsList({
  allPostsData,
}: {
  allPostsData: PostData[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>(allPostsData);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredPosts(allPostsData);
    } else {
      setFilteredPosts(
        allPostsData.filter((post) => post.category === selectedCategory)
      );
    }
  }, [selectedCategory, allPostsData]);

  const categories = Array.from(
    new Set(allPostsData.map((post) => post.category))
  );

  return (
    <>
      <p className="py-7 font-bold text-[20px] text-center">
        {selectedCategory === "All" ? "All" : selectedCategory}
      </p>
      <div className="flex text-[17px] px-2 font-bold mb-6 space-x-6 overflow-x-scroll scrollbar-hide md:justify-center">
        <button
          className={`text-nowrap ${
            selectedCategory === "All"
              ? "text-black dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          }`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`text-nowrap ${
              selectedCategory === category
                ? "text-black dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <ul className="">
        {filteredPosts.map(({ id, date, title, contentHtml, category }) => (
          <li
            key={id}
            className="w-full mb-[15px] p-4 border rounded shadow-md"
          >
            <Link href={`/posts/${id}`}>
              <div>
                <p className="text-xl mb-[10px] font-bold">{title}</p>
                <div
                  className="text-gray-700 dark:text-white mb-[10px] ellipsis"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>
            </Link>
            <div className="flex justify-between">
              <small className="text-gray-400">{date}</small>
              <small className="text-gray-400">{category}</small>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
