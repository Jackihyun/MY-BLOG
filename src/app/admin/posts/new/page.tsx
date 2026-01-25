import PostEditor from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <div className="py-24">
      <PostEditor mode="create" />
    </div>
  );
}
