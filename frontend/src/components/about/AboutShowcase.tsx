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
import {
  motion,
  useReducedMotion,
} from "framer-motion";
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
    title: "만드는 과정에서 가장 많이 배웁니다",
    body: "안녕하세요, Jackihyun입니다. 저는 프론트엔드를 중심으로 공부하고 있지만, 화면 하나가 제대로 동작하기 위해 필요한 백엔드, 인증, 데이터 흐름, 배포와 운영까지 함께 경험해보는 것을 좋아합니다. 직접 만들어보고, 막히면 파고들고, 이해한 것은 다시 제 언어로 정리하는 방식으로 성장하고 있습니다.",
  },
  {
    zone: "laptop",
    eyebrow: "Code",
    title: "아이디어를 실제 화면으로 옮기는 일을 좋아합니다",
    body: "React, Next.js, TypeScript로 사용자가 보는 화면을 만들고, Spring Boot API와 연결하면서 전체 흐름을 맞춰갑니다. 포스트 목록, 검색, 댓글, 리액션, 관리자 에디터처럼 작은 기능도 실제로 쓰는 사람의 입장에서 자연스러운지 확인하며 다듬습니다.",
  },
  {
    zone: "reading",
    eyebrow: "Write",
    title: "기록은 제가 생각을 정리하는 방식입니다",
    body: "블로그에는 기술을 배운 흔적과 구현하면서 만난 시행착오를 남깁니다. 단순히 방법만 적기보다 왜 그렇게 했는지, 어디서 헷갈렸는지, 다음에는 무엇을 다르게 볼 수 있을지를 같이 적으려고 합니다.",
  },
  {
    zone: "exercising",
    eyebrow: "Rhythm",
    title: "꾸준히 반복할 수 있는 리듬을 믿습니다",
    body: "개발은 한 번에 멋진 결과를 내는 일보다, 작게 만들고 계속 고치는 시간이 더 중요하다고 느낍니다. 코드, 글, 운동, 생활 루틴을 무리 없이 이어가며 오래 성장하는 개발자가 되고 싶습니다.",
  },
];

const profileCards = [
  {
    icon: Layers3,
    title: "전체 흐름",
    body: "화면, API, 데이터, 배포가 어떻게 이어지는지 같이 보며 기능을 이해하려고 합니다.",
  },
  {
    icon: Sparkles,
    title: "사용감",
    body: "보기에만 좋은 화면보다 클릭, 이동, 로딩, 빈 상태까지 편한 화면을 좋아합니다.",
  },
  {
    icon: PenLine,
    title: "정리",
    body: "배운 내용을 글로 남기며 제 생각을 확인하고, 다시 꺼내 쓸 수 있게 만듭니다.",
  },
];

const focusItems = [
  "Next.js와 TypeScript로 빠르고 읽기 좋은 프론트엔드 만들기",
  "Spring Boot API, 인증, 데이터 저장 구조를 이해하며 연결하기",
  "관리자 에디터, 댓글, 리액션, 검색처럼 실제 서비스에 필요한 기능 다듬기",
  "AI 도구를 학습, 코드 리뷰, 반복 작업 자동화에 현실적으로 활용하기",
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
    title: "개인 프로젝트를 통해 풀스택 흐름을 익히는 중",
    body: "프론트엔드 화면부터 백엔드 API, 인증, 관리자 기능, SEO까지 하나의 서비스가 돌아가는 과정을 직접 만들어보며 배우고 있습니다.",
  },
  {
    year: "Next",
    title: "프로젝트를 더 분명한 포트폴리오로 정리하기",
    body: "기능 목록보다 어떤 문제를 해결했고 무엇을 배웠는지가 보이는 방식으로 프로젝트와 글을 정리해가고 싶습니다.",
  },
  {
    year: "Always",
    title: "계속 만들고 계속 기록하기",
    body: "작은 기능이라도 직접 완성해보고, 배운 것을 글로 남기며 꾸준히 앞으로 나아가는 사람이 되고 싶습니다.",
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
    <div className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-zinc-950 dark:bg-[#050505] dark:text-zinc-50">
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
                  Jackihyun이 만들고 기록하는 공간입니다.
                </p>
              </div>
              <div className="hidden rounded-full border border-zinc-200/80 bg-white/70 px-4 py-2 text-xs font-bold text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:text-zinc-300 sm:block">
                {activeZone.toUpperCase()}
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
              안녕하세요, Jackihyun입니다. 프론트엔드를 중심으로 공부하며,
              직접 만든 프로젝트를 통해 백엔드, 인증, 데이터 흐름, 운영까지
              하나씩 넓혀가고 있습니다. 이곳에는 제가 만든 것과 배운 것,
              그리고 앞으로 더 잘하고 싶은 방향을 담았습니다.
            </p>

            <div className="mt-8 max-w-2xl border-l border-zinc-300 pl-5 text-sm leading-7 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              지금은 Next.js, TypeScript, Spring Boot를 중심으로 개인 블로그,
              관리자 도구, 콘텐츠 기능, 포트폴리오 정리를 함께 다듬고 있습니다.
            </div>

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
                className="relative min-h-[58vh]"
              >
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
                  제가 개발할 때 자주 보는 것들
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
                하나의 프로젝트를 단순한 화면으로만 보지 않고, 사용자가 만나는
                경험과 그 뒤에서 움직이는 구조까지 함께 이해하려고 합니다.
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
                    {group.label === "Frontend" && (
                      <TerminalSquare className="h-4 w-4 text-indigo-500" />
                    )}
                    {group.label === "Interaction" && (
                      <Dumbbell className="h-4 w-4 text-emerald-500" />
                    )}
                    {group.label === "Backend + Ops" && (
                      <BookOpenText className="h-4 w-4 text-amber-500" />
                    )}
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
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400">
              잘 만든 프로젝트는 겉으로 보이는 화면뿐 아니라 구조, 기록, 운영
              방식까지 함께 남는다고 생각합니다. 그래서 저는 계속 만들고, 써보고,
              고치고, 글로 정리하는 개발자가 되고 싶습니다.
            </p>

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
