import { getSortedPostsData, PostData } from "@/lib/posts";
import PostsList from "@/components/posts/PostList";

export const revalidate = 10; // ISR (Incremental Static Regeneration) 옵션

export default async function PostsPage() {
  const allPostsData: PostData[] = await getSortedPostsData();

  return (
    <div className="py-12">
      <PostsList allPostsData={allPostsData} />
    </div>
  );
}
