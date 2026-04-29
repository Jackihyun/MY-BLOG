import PostEditor from "@/components/admin/PostEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "새 글 작성",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewPostPage() {
  return (
    <div className="py-24">
      <PostEditor mode="create" />
    </div>
  );
}
