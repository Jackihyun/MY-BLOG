"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

type StorySection = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  accent: string;
  note: string;
  metrics: string[];
};

const storySections: StorySection[] = [
  {
    id: "intro",
    kicker: "About Me",
    title: "화면을 읽기 쉽게 만들고, 흐름을 자연스럽게 다듬는 개발자입니다.",
    body:
      "프론트엔드를 가장 좋아하지만, 화면만 예쁘게 만드는 데서 끝내고 싶지는 않습니다. 어떤 정보가 먼저 보여야 하는지, 사용자가 어디서 망설이는지, 다시 수정하기 쉬운 구조인지까지 함께 봅니다.",
    accent: "#2563eb",
    note: "복잡한 기능도 사용자는 자연스럽게 느끼게 만드는 걸 좋아합니다.",
    metrics: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "work",
    kicker: "How I Work",
    title: "작게 만들고, 빠르게 검증하고, 더 명확하게 고칩니다.",
    body:
      "아이디어를 오래 붙잡기보다 먼저 작동하는 형태로 만들고 실제로 써봅니다. 그 다음에 정보 구조, 인터랙션 타이밍, 코드 분리 기준을 다듬으면서 화면과 구현이 함께 좋아지게 만듭니다.",
    accent: "#f97316",
    note: "보여줄 수 있는 프로토타입이 말보다 강하다고 믿습니다.",
    metrics: ["Prototype", "Iteration", "Feedback"],
  },
  {
    id: "focus",
    kicker: "Current Focus",
    title: "요즘은 블로그를 더 좋은 제품처럼 다듬는 데 집중하고 있습니다.",
    body:
      "콘텐츠 구조, 검색 경험, 성능, SEO, 운영 편의성까지 이어지는 흐름을 정리하고 있습니다. 글을 쌓는 공간이 아니라, 다시 방문해도 편하고 신뢰감 있는 개발 아카이브로 만들고 싶습니다.",
    accent: "#14b8a6",
    note: "콘텐츠도 결국 UX의 일부라고 생각합니다.",
    metrics: ["Performance", "SEO", "Content System"],
  },
  {
    id: "outside",
    kicker: "Beyond Code",
    title: "배운 건 흘려보내지 않으려고 기록하고, 설명 가능한 형태로 남깁니다.",
    body:
      "새로운 기술을 익힐 때도 그냥 끝내지 않고 글이나 예제, 구조화된 메모로 남겨두는 편입니다. 그래서 이 블로그는 자기소개 페이지와 이어진, 저의 작업 방식 자체를 보여주는 공간이기도 합니다.",
    accent: "#a855f7",
    note: "혼자 이해하는 코드보다 다음 사람이 이해할 수 있는 구조를 지향합니다.",
    metrics: ["Writing", "Documentation", "Maintainability"],
  },
];

const principles = [
  {
    title: "읽히는 인터페이스",
    body: "처음 보는 사람도 길을 잃지 않도록 정보 밀도와 흐름을 먼저 설계합니다.",
  },
  {
    title: "설명 가능한 구현",
    body: "왜 이렇게 만들었는지 말할 수 있는 구조를 선호합니다. 유지보수는 설계의 일부라고 봅니다.",
  },
  {
    title: "실제 사용 기준",
    body: "예쁜 화면보다 실제 사용감이 중요합니다. 로딩, 빈 상태, 전환의 어색함을 먼저 챙깁니다.",
  },
];

const timeline = [
  "프론트엔드 중심으로 시작해 React와 Next.js에서 재미를 느꼈습니다.",
  "백엔드와 데이터 흐름도 함께 이해하고 싶어서 Spring Boot와 API 설계도 계속 다루고 있습니다.",
  "최근에는 AI 도구를 글 정리, 반복 작업 자동화, 코드 검토 보조까지 연결해 실전적으로 활용하고 있습니다.",
];

const spotlightCards = [
  {
    label: "Main Stack",
    value: "React, Next.js, TypeScript",
  },
  {
    label: "Interested In",
    value: "UI architecture, motion, SEO, content systems",
  },
  {
    label: "Building Now",
    value: "읽기 좋은 개발 블로그와 소개 경험",
  },
];

export default function AboutShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-40, 80]);
  const orbX = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-40, 120]);
  const orbY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, 180]);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const currentStory = storySections[activeSection];

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 w-screen -translate-x-1/2 -mt-20 -mb-20 overflow-hidden bg-[linear-gradient(180deg,#f7f3ec_0%,#f4efe7_30%,#f8fafc_70%,#fffdf8_100%)] text-zinc-900 dark:bg-[linear-gradient(180deg,#09090b_0%,#0f172a_35%,#111827_75%,#09090b_100%)] dark:text-zinc-50"
    >
      <motion.div
        aria-hidden
        style={{ y: backgroundY }}
        className="pointer-events-none absolute inset-0 opacity-70"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:34px_34px] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_52%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_48%)]" />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ x: orbX, y: orbY, backgroundColor: currentStory.accent }}
        className="pointer-events-none absolute right-[-8rem] top-24 h-80 w-80 rounded-full blur-3xl opacity-20 dark:opacity-25"
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-12 px-6 pb-24 pt-20 md:px-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-16 lg:pt-28">
        <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)]">
          <div className="flex h-full flex-col rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_80px_rgba(2,6,23,0.45)] md:p-8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">
                Personal Homepage
              </p>
              <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <motion.div
                  style={{ scaleX: progressScale, originX: 0, backgroundColor: currentStory.accent }}
                  className="h-full w-full rounded-full"
                />
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <motion.p
                key={currentStory.kicker}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="text-sm font-semibold uppercase tracking-[0.24em]"
                style={{ color: currentStory.accent }}
              >
                {currentStory.kicker}
              </motion.p>

              <motion.h1
                key={currentStory.title}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="max-w-xl text-[2.6rem] font-black leading-[1.02] tracking-[-0.04em] text-zinc-950 dark:text-white md:text-[3.6rem]"
              >
                안녕하세요.
                <br />
                Jack을 소개하는
                <br />
                한 페이지입니다.
              </motion.h1>

              <motion.p
                key={currentStory.body}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="max-w-xl text-base leading-8 text-zinc-600 dark:text-zinc-300 md:text-lg"
              >
                {currentStory.body}
              </motion.p>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {spotlightCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-zinc-200/70 bg-white/85 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-200">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <motion.div
              style={{ borderColor: currentStory.accent }}
              className="mt-auto rounded-[1.75rem] border bg-zinc-950 px-5 py-5 text-white dark:bg-white dark:text-zinc-950"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/60 dark:text-zinc-500">
                Active Section Note
              </p>
              <p className="mt-3 text-base leading-7 text-white/88 dark:text-zinc-800">
                {currentStory.note}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentStory.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 dark:border-zinc-300 dark:text-zinc-700"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="space-y-16 lg:space-y-24">
          <section className="grid min-h-[72vh] content-center gap-8 pb-8 pt-4 lg:min-h-[88vh]">
            <div className="max-w-3xl space-y-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">
                Scroll To Read
              </p>
              <h2 className="text-[3rem] font-black leading-[0.96] tracking-[-0.05em] text-zinc-950 dark:text-white md:text-[5.6rem]">
                소개 페이지이지만,
                <br />
                그냥 이력 요약처럼
                <br />
                보이고 싶진 않았습니다.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300 md:text-xl">
                스크롤하면서 제 작업 방식과 관심사가 천천히 드러나는 구조로 만들었습니다.
                과한 장면 전환보다 읽기 흐름, 리듬, 분위기 변화를 우선했습니다.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: reducedMotion ? 0 : index * 0.08 }}
                  className="rounded-[1.75rem] border border-zinc-200/80 bg-white/70 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
                    0{index + 1}
                  </p>
                  <h3 className="mt-4 text-xl font-bold text-zinc-950 dark:text-white">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    {principle.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {storySections.map((section, index) => (
            <motion.section
              key={section.id}
              onViewportEnter={() => setActiveSection(index)}
              viewport={{ amount: 0.55 }}
              className="grid min-h-[72vh] content-center gap-6 rounded-[2rem] border border-zinc-200/70 bg-white/58 p-7 shadow-[0_10px_40px_rgba(15,23,42,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 md:p-10 lg:min-h-[82vh]"
            >
              <p
                className="text-[11px] font-bold uppercase tracking-[0.32em]"
                style={{ color: section.accent }}
              >
                {section.kicker}
              </p>
              <h3 className="max-w-3xl text-[2.2rem] font-black leading-[1.02] tracking-[-0.04em] text-zinc-950 dark:text-white md:text-[3.5rem]">
                {section.title}
              </h3>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <p className="text-base leading-8 text-zinc-600 dark:text-zinc-300 md:text-lg">
                  {section.body}
                </p>
                <div className="rounded-[1.5rem] border border-zinc-200/80 bg-zinc-50/85 p-5 dark:border-white/10 dark:bg-zinc-950/40">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
                    Keywords
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {section.metrics.map((metric) => (
                      <motion.span
                        key={metric}
                        whileHover={reducedMotion ? undefined : { y: -2 }}
                        className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                      >
                        {metric}
                      </motion.span>
                    ))}
                  </div>
                  <div
                    className="mt-5 rounded-2xl p-4 text-sm font-medium leading-7 text-zinc-700 dark:text-zinc-200"
                    style={{
                      backgroundColor: `${section.accent}14`,
                      border: `1px solid ${section.accent}33`,
                    }}
                  >
                    {section.note}
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          <section className="grid gap-6 rounded-[2rem] border border-zinc-200/80 bg-white/68 p-7 backdrop-blur-md dark:border-white/10 dark:bg-white/5 md:p-10">
            <div className="max-w-3xl space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">
                Journey
              </p>
              <h3 className="text-[2rem] font-black leading-[1.05] tracking-[-0.04em] text-zinc-950 dark:text-white md:text-[3rem]">
                지금은 한 가지 역할보다,
                <br />
                화면과 콘텐츠를 함께 설계하는 사람에 가깝습니다.
              </h3>
            </div>

            <div className="space-y-4">
              {timeline.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.5, delay: reducedMotion ? 0 : index * 0.08 }}
                  className="grid gap-3 rounded-[1.5rem] border border-zinc-200/70 bg-white/90 p-5 dark:border-white/10 dark:bg-zinc-950/35 md:grid-cols-[80px_minmax(0,1fr)]"
                >
                  <p className="text-sm font-black tracking-[-0.03em] text-zinc-400 dark:text-zinc-500">
                    0{index + 1}
                  </p>
                  <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-200 md:text-base">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="grid gap-8 rounded-[2rem] bg-zinc-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] dark:bg-white dark:text-zinc-950 md:p-10">
            <div className="max-w-3xl space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/55 dark:text-zinc-500">
                Final Section
              </p>
              <h3 className="text-[2rem] font-black leading-[1.05] tracking-[-0.04em] md:text-[3rem]">
                블로그와 GitHub도 결국,
                <br />
                제가 어떻게 배우고 만드는지 보여주는 기록입니다.
              </h3>
              <p className="text-base leading-8 text-white/75 dark:text-zinc-700 md:text-lg">
                더 보고 싶다면 글을 읽어보셔도 좋고, GitHub에서 작업 흔적을 보는 것도 좋습니다.
                소개 페이지는 여기서 끝나지만, 저는 계속 만들고 정리하고 개선하는 중입니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/posts"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition-transform hover:scale-[1.02] dark:bg-zinc-950 dark:text-white"
              >
                글 보러가기
              </Link>
              <a
                href="https://github.com/jackihyun"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] dark:border-zinc-300 dark:text-zinc-900"
              >
                GitHub
              </a>
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "your@email.com"}`}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white/88 transition-transform hover:scale-[1.02] dark:border-zinc-300 dark:text-zinc-900"
              >
                Contact
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
