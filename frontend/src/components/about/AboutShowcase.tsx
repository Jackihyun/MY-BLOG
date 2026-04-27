"use client";

import AboutScene, { ActiveZone } from "@/components/about/AboutScene";
import {
  ArrowUpRight,
  BookOpenText,
  Braces,
  Dumbbell,
  Github,
  Layers3,
  PenLine,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { UIEvent } from "react";
import { useRef, useState } from "react";

const sceneSteps: {
  zone: ActiveZone;
  eyebrow: string;
  title: string;
  body: string;
}[] = [
  {
    zone: "all",
    eyebrow: "Hello",
    title: "화면을 설계하고, 배운 것을 기록하는 사람",
    body: "이 페이지의 문장은 나중에 편하게 바꿀 수 있도록 분리해 두었습니다. 지금은 Jack이라는 사람이 어떤 결로 만들고 기록하는지, 스크롤의 리듬과 인터랙션으로 먼저 느껴지게 구성했습니다.",
  },
  {
    zone: "laptop",
    eyebrow: "Build",
    title: "기능을 구현할 때는 흐름부터 봅니다",
    body: "React, Next.js, TypeScript를 중심으로 사용자가 실제로 지나가는 길을 먼저 그립니다. 상태, 로딩, 오류, 빈 화면까지 한 화면의 일부로 보고 안정적인 경험을 만드는 쪽을 좋아합니다.",
  },
  {
    zone: "reading",
    eyebrow: "Reflect",
    title: "배운 것은 다시 꺼낼 수 있게 남깁니다",
    body: "블로그는 완성된 답을 전시하는 곳이라기보다, 선택의 이유와 실패한 경로를 같이 보관하는 작업실에 가깝습니다. 미래의 제가 다시 읽어도 쓸 수 있는 글을 목표로 씁니다.",
  },
  {
    zone: "exercising",
    eyebrow: "Rhythm",
    title: "오래 갈 수 있는 루틴을 중요하게 봅니다",
    body: "새로운 기술을 빠르게 따라가는 것도 좋지만, 결국 남는 것은 꾸준히 만들고 다듬는 힘이라고 생각합니다. 작게 실험하고, 검증하고, 다시 정리하는 리듬을 계속 키우고 있습니다.",
  },
];

const profileCards = [
  {
    icon: Layers3,
    title: "구조",
    body: "컴포넌트 경계와 데이터 흐름을 먼저 정리해서, 나중에 손대기 쉬운 화면을 만듭니다.",
  },
  {
    icon: Sparkles,
    title: "감각",
    body: "과한 장식보다 읽는 속도, 여백, 움직임의 타이밍이 맞는 인터페이스를 좋아합니다.",
  },
  {
    icon: PenLine,
    title: "기록",
    body: "구현 과정의 판단과 시행착오를 글로 남겨 다시 꺼내 쓸 수 있는 지식으로 바꿉니다.",
  },
];

const focusItems = [
  "Next.js App Router 기반 블로그 경험 고도화",
  "React 상태 관리와 서버 데이터 흐름 단순화",
  "Spring Boot API와 프론트엔드 연결 품질 개선",
  "AI 도구를 활용한 반복 작업 자동화와 리뷰 루틴",
];

const stackGroups = [
  {
    label: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "TanStack Query"],
  },
  {
    label: "Interaction",
    items: ["Framer Motion", "Three.js", "R3F", "Shadcn/UI", "Tiptap"],
  },
  {
    label: "Backend + Ops",
    items: ["Spring Boot", "JPA", "SQLite", "SEO", "Performance"],
  },
];

const timeline = [
  {
    year: "Now",
    title: "블로그를 하나의 제품처럼 다듬는 중",
    body: "글 목록, 검색, 반응, 댓글, SEO, 관리자 작성 흐름까지 실제 운영 경험을 기준으로 계속 개선하고 있습니다.",
  },
  {
    year: "Next",
    title: "더 나은 기록 시스템 만들기",
    body: "마크다운 콘텐츠와 에디터 경험을 연결해, 생각을 빠르게 남기고 보기 좋게 발행하는 구조를 만들고 싶습니다.",
  },
  {
    year: "Always",
    title: "사용자에게 설명하지 않아도 되는 화면",
    body: "버튼, 상태, 피드백, 이동 흐름이 자연스러워서 별도 설명 없이도 사용할 수 있는 화면을 계속 연습합니다.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

function getZoneFromProgress(progress: number): ActiveZone {
  if (progress < 0.24) {
    return "all";
  }
  if (progress < 0.5) {
    return "laptop";
  }
  if (progress < 0.76) {
    return "reading";
  }
  return "exercising";
}

export default function AboutShowcase() {
  const scrollPaneRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const [activeZone, setActiveZone] = useState<ActiveZone>("all");

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const maxScroll = Math.max(scrollHeight - clientHeight, 1);
    setActiveZone(getZoneFromProgress(scrollTop / maxScroll));
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-zinc-950 dark:bg-[#050505] dark:text-zinc-50"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.035)_1px,transparent_1px)] bg-[size:44px_44px] dark:bg-[linear-gradient(rgba(244,244,245,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(244,244,245,0.035)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_18%_20%,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(16,185,129,0.13),transparent_30%),radial-gradient(circle_at_58%_42%,rgba(245,158,11,0.12),transparent_36%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_58%_42%,rgba(245,158,11,0.12),transparent_36%)]" />

      <div className="about-grid relative grid min-h-screen lg:grid-cols-[minmax(420px,48vw)_1fr]">
        <aside className="lg:sticky lg:top-0 lg:h-screen">
          <div className="about-scene-panel relative h-[68vh] min-h-[520px] overflow-hidden border-b border-zinc-200/70 bg-white/35 dark:border-zinc-800/70 dark:bg-zinc-950/25 lg:h-screen lg:border-b-0 lg:border-r">
            <div className="absolute inset-0">
              <AboutScene
                reducedMotion={reducedMotion}
                activeZone={activeZone}
                onZoneClick={setActiveZone}
              />
            </div>

            <div className="pointer-events-none absolute left-5 right-5 top-24 z-10 flex items-center justify-between gap-4 md:left-10 md:right-10 lg:top-28">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                  Jack&#39;s Room
                </p>
                <p className="mt-2 max-w-[280px] text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  스크롤하면 방 안의 장면도 함께 바뀝니다.
                </p>
              </div>
              <div className="hidden rounded-full border border-zinc-200/80 bg-white/70 px-4 py-2 text-xs font-bold text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:text-zinc-300 sm:block">
                {activeZone.toUpperCase()}
              </div>
            </div>

            <div className="absolute bottom-6 left-5 right-5 z-10 md:left-10 md:right-10">
              <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/70 bg-white/70 p-2 shadow-xl shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/70 dark:shadow-black/25">
                {sceneSteps.map((step) => (
                  <button
                    key={step.zone}
                    type="button"
                    onClick={() => setActiveZone(step.zone)}
                    className={`h-2 rounded-full transition-all ${
                      activeZone === step.zone
                        ? "bg-zinc-950 dark:bg-white"
                        : "bg-zinc-300 hover:bg-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-500"
                    }`}
                    aria-label={`${step.eyebrow} 장면 보기`}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div
          ref={scrollPaneRef}
          onScroll={handleScroll}
          className="about-scroll-pane relative px-6 pb-24 pt-20 md:px-10 lg:h-screen lg:overflow-y-auto lg:px-14 lg:pb-32 lg:pt-32 xl:px-20"
        >
          <motion.section
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="min-h-[76vh] max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300">
              <TerminalSquare className="h-4 w-4 text-indigo-500" />
              About Jack
            </div>

            <h1 className="mt-8 max-w-[780px] text-5xl font-extrabold leading-[1.08] text-zinc-950 dark:text-white md:text-7xl">
              만들고,
              <br />
              기록하고,
              <br />
              다시 다듬습니다.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              안녕하세요, Jack입니다. 프론트엔드를 중심으로 화면의 구조와 감각을 함께 고민합니다. 이 페이지는 제 소개를 담는 동시에, 제가 좋아하는 인터랙션과 정리 방식을 보여주는 작은 포트폴리오처럼 만들었습니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-zinc-900/10 transition hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                글 보러가기
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/jackihyun"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/75 px-5 py-3 text-sm font-bold text-zinc-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/75 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </motion.section>

          <section className="max-w-3xl space-y-28">
            {sceneSteps.map((step, index) => (
              <motion.article
                key={step.zone}
                initial="hidden"
                whileInView="show"
                viewport={{ amount: 0.55, margin: "-12% 0px -12% 0px" }}
                variants={fadeUp}
                transition={{ duration: 0.65, ease: "easeOut" }}
                onViewportEnter={() => setActiveZone(step.zone)}
                className="relative min-h-[58vh] border-l border-zinc-200 pl-6 dark:border-zinc-800 md:pl-9"
              >
                <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-4 border-[#fbfaf7] bg-zinc-950 dark:border-[#050505] dark:bg-white" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500 dark:text-indigo-300">
                  {String(index + 1).padStart(2, "0")} / {step.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight text-zinc-950 dark:text-white md:text-5xl">
                  {step.title}
                </h2>
                <p className="mt-6 text-lg leading-9 text-zinc-600 dark:text-zinc-300">
                  {step.body}
                </p>
              </motion.article>
            ))}
          </section>

          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mt-8 max-w-4xl"
          >
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                  Working Style
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 dark:text-white md:text-4xl">
                  제가 화면을 볼 때 챙기는 것들
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {profileCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    variants={fadeUp}
                    className="rounded-[8px] border border-zinc-200 bg-white/78 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950/72 dark:hover:shadow-black/20"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                      {card.body}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mt-28 grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
                Current Focus
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 dark:text-white md:text-4xl">
                요즘 집중하는 것
              </h2>
              <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">
                실제로 운영하는 블로그를 바탕으로, 보기 좋은 화면과 계속 고칠 수 있는 구조 사이의 균형을 연습하고 있습니다.
              </p>
            </div>
            <div className="space-y-3">
              {focusItems.map((item, index) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  className="flex items-start gap-4 rounded-[8px] border border-zinc-200 bg-white/72 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/72"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-7 text-zinc-700 dark:text-zinc-200">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mt-28 max-w-5xl"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500 dark:text-indigo-300">
                  Tool Belt
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 dark:text-white md:text-4xl">
                  주로 다루는 기술
                </h2>
              </div>
              <Braces className="hidden h-10 w-10 text-zinc-300 dark:text-zinc-700 md:block" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stackGroups.map((group) => (
                <motion.div
                  key={group.label}
                  variants={fadeUp}
                  className="rounded-[8px] border border-zinc-200 bg-white/72 p-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/72"
                >
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white">
                    {group.label === "Frontend" && <TerminalSquare className="h-4 w-4 text-indigo-500" />}
                    {group.label === "Interaction" && <Dumbbell className="h-4 w-4 text-emerald-500" />}
                    {group.label === "Backend + Ops" && <BookOpenText className="h-4 w-4 text-amber-500" />}
                    {group.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mt-28 max-w-4xl pb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
              Direction
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 dark:text-white md:text-4xl">
              앞으로 더 선명하게 만들고 싶은 방향
            </h2>

            <div className="mt-8 divide-y divide-zinc-200 overflow-hidden rounded-[8px] border border-zinc-200 bg-white/78 backdrop-blur dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/72">
              {timeline.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="grid gap-3 p-6 md:grid-cols-[120px_1fr]"
                >
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-zinc-400">
                    {item.year}
                  </p>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

    </div>
  );
}
