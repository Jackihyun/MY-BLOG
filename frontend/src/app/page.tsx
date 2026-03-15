import Link from "next/link";
import { getSortedPostsData, PostData } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/home/HeroSection";
import RecentPosts from "@/components/home/RecentPosts";
import PopularPosts from "@/components/home/PopularPosts";
import TechStack from "@/components/home/TechStack";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const allPosts: PostData[] = await getSortedPostsData();
  const recentPosts = allPosts.slice(0, 4);
  const popularPosts = [...allPosts]
    .filter((post) => post.viewCount && post.viewCount > 0)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 3);

  return (
    <div className="space-y-16 py-8">
      <HeroSection />
      {popularPosts.length > 0 && <PopularPosts posts={popularPosts} />}
      <RecentPosts posts={recentPosts} />
      <TechStack />
    </div>
  );
}
