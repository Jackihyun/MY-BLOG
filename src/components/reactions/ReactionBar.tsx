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
    <div className="py-6 border-t border-b border-zinc-100 dark:border-zinc-800/50">
      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-4 uppercase tracking-widest">
        Enjoyed this post?
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all
                active:scale-95
                ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50"
                    : "bg-zinc-50 dark:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                }`}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span
                  className={`text-xs font-bold ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all
            active:scale-95
            ${
              liked
                ? "bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400"
                : "bg-zinc-50 dark:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            }`}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span>Like</span>
          {likeCount > 0 && (
            <span className="text-xs ml-1 opacity-60">{likeCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}
