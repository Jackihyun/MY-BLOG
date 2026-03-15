import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const decodedSlug = decodeURIComponent(params.slug || "");
  if (!decodedSlug || decodedSlug.includes("..") || decodedSlug.includes("/")) {
    return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "src/posts", `${decodedSlug}.md`);
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ message: "Legacy post not found" }, { status: 404 });
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const processed = await remark().use(html).process(matterResult.content);

  return NextResponse.json({
    slug: decodedSlug,
    title: matterResult.data.title || decodedSlug,
    category: matterResult.data.category || "Uncategorized",
    contentHtml: processed.toString(),
    excerpt: matterResult.data.excerpt || "",
  });
}
