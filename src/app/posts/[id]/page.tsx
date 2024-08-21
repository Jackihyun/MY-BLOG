import { getPostData, getAllPostIds } from "@/lib/posts";
import Link from "next/link";

interface PostProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostProps) {
  const postData = await getPostData(params.id);

  return (
    <div>
      <div className="border-b border-gray-400 my-[40px]">
        <p className="text-sm mb-[5px] text-[#989ba0] font-pretendard-regular dark:text-[#8e8f97]">
          {postData.category}
        </p>
        <p className="text-2xl mb-[6px] font-pretendard-semibold text-[#of1010] dark:text-[#e6e6e6]">
          {postData.title}
        </p>
        <p className="text-sm text-[#989ba0] font-pretendard-regular dark:text-[#8e8f97]">
          {postData.date}
        </p>
      </div>
      <div
        className="text-[#of1010] font-pretendard-regular dark:text-[#e6e6e6]"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
      <div className="flex flex-col pt-[80px] text-[14px] md:text-[17px] text-center pb-[20px] gap-2 font-pretendard-semibold">
        <p>재미있게 보셨다면! 방명록에 글을 남겨주세요!</p>
        <Link
          href="/guest"
          className="text-blue-500 dark:text-red-400 inline-block underline hover:scale-95"
        >
          <p>방명록 바로가기 -&gt;</p>
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const ids = getAllPostIds();
  return ids.map((id) => ({
    id: id.id,
  }));
}
