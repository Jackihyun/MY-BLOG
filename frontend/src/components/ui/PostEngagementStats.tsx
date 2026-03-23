import { cn } from "@/lib/utils";

interface PostEngagementStatsProps {
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  showViews?: boolean;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  compact?: boolean;
}

function formatCount(value?: number) {
  return (value || 0).toLocaleString();
}

export default function PostEngagementStats({
  viewCount,
  likeCount,
  commentCount,
  showViews = true,
  className,
  itemClassName,
  iconClassName,
  compact = false,
}: PostEngagementStatsProps) {
  const items = [
    {
      key: "views",
      label: "조회수",
      value: formatCount(viewCount),
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ),
    },
    {
      key: "likes",
      label: "좋아요",
      value: formatCount(likeCount),
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.017 5.633c1.827-1.625 4.804-1.577 6.543.133 1.744 1.715 1.797 4.495.118 6.272l-7.628 7.799a1.5 1.5 0 01-2.144 0l-7.628-7.799c-1.679-1.777-1.626-4.557.118-6.272 1.739-1.71 4.716-1.758 6.543-.133L12 7.24l2.017-1.607z" />
      ),
    },
    {
      key: "comments",
      label: "댓글",
      value: formatCount(commentCount),
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
  ].filter((item) => (showViews ? true : item.key !== "views"));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400",
        compact ? "text-[11px] font-semibold" : "text-xs font-semibold",
        className
      )}
    >
      {items.map((item) => (
        <span
          key={item.key}
          className={cn("inline-flex items-center gap-1.5", itemClassName)}
          aria-label={`${item.label} ${item.value}`}
        >
          <svg
            className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", iconClassName)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {item.icon}
          </svg>
          <span>{item.value}</span>
        </span>
      ))}
    </div>
  );
}
