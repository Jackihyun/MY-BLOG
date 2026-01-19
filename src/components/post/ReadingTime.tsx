interface ReadingTimeProps {
  minutes?: number;
  content?: string;
}

export default function ReadingTime({ minutes, content }: ReadingTimeProps) {
  let readingTime = minutes;

  if (!readingTime && content) {
    const wordCount = content.split(/\s+/).length;
    const koreanCharCount = (content.match(/[\uAC00-\uD7A3]/g) || []).length;
    const totalCount = wordCount + Math.floor(koreanCharCount / 2);
    readingTime = Math.max(1, Math.ceil(totalCount / 200));
  }

  if (!readingTime) return null;

  return (
    <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {readingTime}분
    </span>
  );
}
