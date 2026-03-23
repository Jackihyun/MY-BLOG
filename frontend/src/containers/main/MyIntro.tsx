"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function MyIntro() {
  const focusAreas = [
    {
      title: "기록",
      description:
        "배운 내용을 그냥 지나치지 않고, 다시 꺼내 볼 수 있는 글로 정리합니다.",
    },
    {
      title: "구현",
      description:
        "프론트엔드 중심으로 직접 만들고 부딪히면서 감을 익히는 과정을 좋아합니다.",
    },
    {
      title: "개선",
      description:
        "작은 불편도 그냥 넘기지 않고 더 읽기 좋고 쓰기 좋은 블로그를 계속 다듬습니다.",
    },
  ];

  const stack = [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Spring Boot",
    "SQLite",
  ];

  const principles = [
    "읽는 사람이 바로 이해할 수 있는 글과 코드",
    "기능보다 경험까지 챙기는 화면 설계",
    "작게 만들고 자주 개선하는 작업 방식",
  ];

  return (
    <div className="space-y-8 md:space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-gradient-to-br from-white via-zinc-50 to-indigo-50/70 p-8 shadow-sm dark:border-zinc-800 dark:from-[#0a0a0a] dark:via-zinc-950 dark:to-indigo-950/30 md:p-10"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),_transparent_30%)]" />
        <Badge
          variant="secondary"
          className="mb-4 rounded-full border-none bg-white/80 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-600 dark:bg-zinc-900/80 dark:text-indigo-300"
        >
          About
        </Badge>
        <div className="max-w-3xl space-y-5">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
            만들면서 배우고,
            <br />
            글로 남기며 정리하는 개발자 Jack입니다.
          </h1>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400 md:text-lg">
            이 블로그는 프론트엔드 개발을 중심으로, 직접 부딪히며 배운 것과 구현
            과정에서 얻은 감각을 차분히 쌓아두는 공간입니다. 빠르게 소비되는
            정보보다, 나중에 다시 꺼내 봐도 도움이 되는 기록을 남기고 싶습니다.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/posts"
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              최근 글 보러가기
            </Link>
            <a
              href="https://github.com/jackihyun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              GitHub
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {focusAreas.map((item, index) => (
          <Card
            key={item.title}
            className="border-zinc-200/80 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-[#0a0a0a]"
          >
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
                0{index + 1}
              </p>
              <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"
      >
        <Card className="border-zinc-200/80 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-[#0a0a0a]">
          <CardContent className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
              What I Write
            </p>
            <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              이 블로그에서 주로 다루는 것들
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400 md:text-base">
              <p>
                React, Next.js, TypeScript처럼 실제로 자주 쓰는 기술을 중심으로
                화면을 만드는 과정과 시행착오를 정리합니다.
              </p>
              <p>
                단순 사용법보다는 왜 그렇게 구현했는지, 어디에서 불편했고 어떻게
                개선했는지를 함께 남기려고 합니다.
              </p>
              <p>
                기능을 하나씩 붙여가며 블로그 자체를 계속 개선하고 있어서, 이
                공간 자체가 하나의 실험장이기도 합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-[#0a0a0a]">
          <CardContent className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
              Stack
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {stack.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid gap-4 lg:grid-cols-[1fr_1.1fr]"
      >
        <Card className="border-zinc-200/80 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-[#0a0a0a]">
          <CardContent className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
              Principles
            </p>
            <div className="mt-4 space-y-3">
              {principles.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-zinc-900 text-white shadow-sm dark:border-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
          <CardContent className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 dark:text-zinc-500">
              Connect
            </p>
            <h2 className="mt-4 text-2xl font-bold">
              같이 이야기 나누고 싶은 주제가 있다면
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300 dark:text-zinc-600">
              프론트엔드, 블로그 개선, AI 활용, 사이드 프로젝트처럼 관심사가
              겹치는 주제라면 언제든 반갑습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://github.com/jackihyun"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                GitHub
              </a>
              <a
                href="https://jackihyun.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-2xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10 dark:border-zinc-300 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Portfolio
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
