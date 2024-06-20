import { getPostData, getAllPostIds } from "@/lib/posts";

interface PostProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostProps) {
  const postData = await getPostData(params.id);

  return (
    <div>
      <div className="border-b border-gray-400 my-[40px] pb-[40px]">
        <p className="text-sm mb-[5px] text-[#989ba0] dark:text-[#8e8f97]">
          {postData.category}
        </p>
        <p className="text-2xl mb-[6px] text-[#of1010] dark:text-[#e6e6e6]">
          {postData.title}
        </p>
        <p className="text-sm text-[#989ba0] dark:text-[#8e8f97]">
          {postData.date}
        </p>
      </div>
      <div
        className="text-[#of1010] dark:text-[#e6e6e6]"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const ids = getAllPostIds();
  return ids.map((id) => ({
    id: id.id,
  }));
}
