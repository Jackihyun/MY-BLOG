import { Skeleton, SkeletonText } from "../ui/Skeleton";

export default function PostCardSkeleton() {
  return (
    <li className="w-full mb-[15px] p-4 border rounded-2xl shadow-sm">
      <div>
        <SkeletonText className="w-3/4 h-6 mb-3" />
        <div className="space-y-2 mb-3">
          <SkeletonText className="w-full" />
          <SkeletonText className="w-5/6" />
          <SkeletonText className="w-4/6" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
    </li>
  );
}

export function PostCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <ul>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </ul>
  );
}
