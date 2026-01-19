import { getSortedPostsData } from "@/lib/posts";

export async function GET() {
  const posts = await getSortedPostsData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jackblog.com";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Jack's Blog";

  const rssItems = posts
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const description = post.excerpt || post.title;

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.id}</link>
      <guid isPermaLink="true">${siteUrl}/posts/${post.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${post.category}]]></category>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>개발 블로그 by Jackihyun</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
