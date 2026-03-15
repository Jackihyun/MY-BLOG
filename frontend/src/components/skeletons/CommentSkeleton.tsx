import { Skeleton, SkeletonText } from "../ui/Skeleton";

export default function CommentSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#2a2a2a]">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-32 h-3" />
      </div>
      <div className="space-y-2">
        <SkeletonText className="w-full" />
        <SkeletonText className="w-4/5" />
      </div>
    </div>
  );
}

export function CommentSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}
