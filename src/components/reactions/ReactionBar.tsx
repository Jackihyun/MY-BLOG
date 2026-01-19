"use client";

import { useReactions } from "@/hooks/useReactions";

interface ReactionBarProps {
  slug: string;
}

const EMOJIS = [
  { emoji: "👍", label: "좋아요" },
  { emoji: "❤️", label: "사랑해요" },
  { emoji: "🎉", label: "축하해요" },
  { emoji: "🤔", label: "생각해볼게요" },
  { emoji: "👀", label: "관심있어요" },
  { emoji: "🚀", label: "대단해요" },
];

export default function ReactionBar({ slug }: ReactionBarProps) {
  const { reactions, liked, likeCount, isLoading, handleReaction, handleLike } =
    useReactions(slug);

  if (isLoading) {
    return (
      <div className="flex gap-2 py-4">
        {EMOJIS.map(({ emoji }) => (
          <div
            key={emoji}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse"
          >
            <span className="opacity-50">{emoji}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="py-4 border-t border-b border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        이 글이 도움이 되셨나요?
      </p>

      <div className="flex flex-wrap gap-2">
        {EMOJIS.map(({ emoji, label }) => {
          const count = reactions.counts[emoji] || 0;
          const isActive = reactions.userReactions.includes(emoji);

          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all
                ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                }`}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all
            ${
              liked
                ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-600 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            }`}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span>좋아요</span>
          {likeCount > 0 && (
            <span className="text-xs ml-1">({likeCount})</span>
          )}
        </button>
      </div>
    </div>
  );
}
