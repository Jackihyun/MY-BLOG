import PostEditor from "@/components/admin/PostEditor";

interface EditPostPageProps {
  params: {
    slug: string;
  };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const decodedSlug = decodeURIComponent(params.slug);
  return <PostEditor mode="edit" slug={decodedSlug} />;
}
