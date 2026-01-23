import Link from "next/link";
import { getSortedPostsData, PostData } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/home/HeroSection";
import RecentPosts from "@/components/home/RecentPosts";
import TechStack from "@/components/home/TechStack";

export const revalidate = 10;

export default async function HomePage() {
  const allPosts: PostData[] = await getSortedPostsData();
  const recentPosts = allPosts.slice(0, 4);

  return (
    <div className="space-y-16 py-8">
      <HeroSection />
      <RecentPosts posts={recentPosts} />
      <TechStack />
    </div>
  );
}
