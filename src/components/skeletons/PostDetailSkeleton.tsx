import { Skeleton, SkeletonText } from "../ui/Skeleton";

export default function PostDetailSkeleton() {
  return (
    <div>
      <div className="border-b border-gray-400 my-[40px]">
        <Skeleton className="w-20 h-4 mb-2" />
        <Skeleton className="w-3/4 h-8 mb-3" />
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>

      <article className="space-y-4">
        <SkeletonText className="w-full h-5" />
        <SkeletonText className="w-full h-5" />
        <SkeletonText className="w-5/6 h-5" />
        <Skeleton className="w-full h-48 my-4" />
        <SkeletonText className="w-full h-5" />
        <SkeletonText className="w-4/5 h-5" />
        <SkeletonText className="w-full h-5" />
        <SkeletonText className="w-3/4 h-5" />
      </article>
    </div>
  );
}
