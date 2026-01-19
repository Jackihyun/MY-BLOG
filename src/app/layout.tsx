import type { Metadata } from "next";
import { ReactNode } from "react";
import RecoilProvider from "./recoil-provider";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

interface RootLayoutProps {
  children: ReactNode;
}

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jackblog.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Jack's Blog";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "개발 블로그 by Jackihyun - 프론트엔드, 백엔드, 그리고 더 많은 것들",
  keywords: ["개발", "프로그래밍", "프론트엔드", "백엔드", "JavaScript", "TypeScript", "React", "Next.js"],
  authors: [{ name: "Jackihyun" }],
  creator: "Jackihyun",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: "개발 블로그 by Jackihyun",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: "개발 블로그 by Jackihyun",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
  verification: {
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/feed.xml"
        />
      </head>
      <body
        className={`${inter.className} place-items-center flex flex-col min-h-screen`}
      >
        <RecoilProvider>
          <Header />

          <main className="flex-grow w-full pt-[60px] py-[100px] px-4 max-w-[720px]">
            {children}
          </main>
          <Footer />
        </RecoilProvider>
      </body>
    </html>
  );
}
