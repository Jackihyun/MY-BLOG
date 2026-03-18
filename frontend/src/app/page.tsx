import { getPopularPostsData, getSortedPostsData, PostData } from "@/lib/posts";
import HeroSection from "@/components/home/HeroSection";
import RecentPosts from "@/components/home/RecentPosts";
import PopularPosts from "@/components/home/PopularPosts";
import TechStack from "@/components/home/TechStack";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const allPosts: PostData[] = await getSortedPostsData();
  const recentPosts = allPosts.slice(0, 4);
  const popularPosts = await getPopularPostsData(3);

  return (
    <div className="space-y-16 py-8">
      <HeroSection />
      <PopularPosts posts={popularPosts} />
      <RecentPosts posts={recentPosts} />
      <TechStack />
    </div>
  );
}
