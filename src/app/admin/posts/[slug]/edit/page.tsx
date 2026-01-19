import PostEditor from "@/components/admin/PostEditor";

interface EditPostPageProps {
  params: {
    slug: string;
  };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  return <PostEditor mode="edit" slug={params.slug} />;
}
