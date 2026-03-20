"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import AboutScene, { ActiveZone } from "@/components/about/AboutScene";

const profileHighlights = [
  {
    index: "01",
    title: "프론트엔드를 좋아합니다",
    description:
      "화면이 어떻게 보이는지보다, 어떻게 읽히고 어떻게 느껴지는지까지 같이 챙기는 일을 좋아합니다.",
  },
  {
    index: "02",
    title: "만들면서 배우는 편입니다",
    description:
      "기능을 붙여보고, 부딪혀보고, 다시 고치면서 익히는 방식이 저한테 가장 잘 맞습니다.",
  },
  {
    index: "03",
    title: "배운 건 남겨두려고 합니다",
    description:
      "정리하지 않으면 금방 흩어지는 편이라, 글로 남기고 다시 꺼내 보며 제 것으로 만드는 편입니다.",
  },
];

const introSections = [
  {
    label: "요즘의 저",
    title:
      "프론트엔드를 중심으로, 백엔드와 AI 활용까지 조금씩 넓혀가고 있습니다",
    body: "가장 재미를 느끼는 건 여전히 프론트엔드입니다. React, Next.js, TypeScript로 화면을 설계하고 다듬는 일을 좋아하고, 그 위에 모션이나 인터랙션을 얹어 사용자 경험을 더 자연스럽게 만드는 데 관심이 많습니다. 동시에 백엔드도 꾸준히 공부하면서 전체 흐름을 이해하려 하고, AI를 실제 작업에 어떻게 연결할 수 있을지도 계속 실험하고 있습니다.",
  },
  {
    label: "블로그를 하는 이유",
    title: "배운 걸 흘려보내지 않으려고 씁니다",
    body: "새로 알게 된 걸 그냥 넘기면 금방 흐릿해지는 편이라, 글로 정리하면서 한 번 더 제 언어로 바꿔보려고 합니다. 그래서 이 블로그는 누군가에게 보여주기 위한 공간이기도 하지만, 저한테는 공부한 내용을 다시 꺼내 볼 수 있는 개인 아카이브에 가깝습니다.",
  },
  {
    label: "중요하게 보는 것",
    title: "읽기 쉽고, 자연스럽고, 오래 다듬을 수 있는 화면",
    body: "저는 화면을 만들 때 과한 장식보다 흐름을 더 중요하게 봅니다. 처음 봤을 때 어렵지 않고, 쓰는 동안 걸리는 부분이 적고, 나중에 다시 봐도 구조가 무너지지 않는 화면을 좋아합니다. 이 About 페이지도 그런 기준 안에서 3D와 인터랙션을 덜어내지 않고, 그렇다고 앞세우지도 않으려고 했습니다.",
  },
];

const stackGroups = [
  {
    title: "주로 쓰는 기술",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "표현을 더할 때",
    items: ["Framer Motion", "Three.js", "R3F"],
  },
  {
    title: "함께 넓혀가는 영역",
    items: ["Spring Boot", "SQLite", "Performance", "SEO"],
  },
];

export default function AboutShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [activeZone, setActiveZone] = useState<ActiveZone>("all");

  return (
    // 배경색을 투명하게(bg-transparent) 처리하여 부모 레이아웃의 배경과 자연스럽게 이어지도록 수정
    <div className="flex flex-col lg:flex-row min-h-screen bg-transparent">
      {/* Left Column: 3D Scene (Sticky) */}
      <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center">
        {/* Background Gradients (은은하게) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.03),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <AboutScene reducedMotion={prefersReducedMotion} activeZone={activeZone} onZoneClick={setActiveZone} />
        
        <div className="absolute left-6 top-6 lg:left-10 lg:top-10 pointer-events-none">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Interactive Room
          </p>
          <p className="text-xs text-zinc-400 mt-1">방 안의 구역을 클릭해보세요.</p>
        </div>
      </div>

      {/* Right Column: Scrollable Content */}
      <div className="w-full lg:w-1/2 px-6 py-16 md:px-12 lg:px-20 lg:py-32 space-y-32">
        
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 text-xs font-semibold text-zinc-700 dark:text-zinc-300 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            About Jack
          </div>

          <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-black leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-50">
            안녕하세요,<br />
            Jack입니다.
          </h1>
          
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            화면을 설계하고 다듬는 일을 좋아합니다. 기능만 되는 것보다
            읽기 쉽고, 흐름이 자연스럽고, 다시 손대기 좋은 구조를 더
            좋아합니다. 이 페이지는 저를 소개하는 공간이지만, 동시에 제가
            화면을 다루는 방식이 자연스럽게 보이도록 만든 About이기도 합니다.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/posts"
              className="inline-flex items-center justify-center bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl shadow-sm"
            >
              글 보러가기
            </Link>
            <a
              href="https://github.com/jackihyun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 px-6 py-3.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:scale-[1.02] rounded-xl shadow-sm"
            >
              GitHub
            </a>
          </div>
        </motion.section>

        {/* Interactive Routine Section */}
        <motion.section
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            나의 루틴 살펴보기
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            아래 카드를 클릭하면 왼쪽 방의 시점이 이동합니다.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { id: "laptop", label: "💻 코딩/작업" },
              { id: "reading", label: "📚 독서/기록" },
              { id: "exercising", label: "🏋️ 운동/휴식" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveZone(btn.id as ActiveZone)}
                className={`px-4 py-4 rounded-2xl border text-sm font-semibold transition-all text-left ${
                  activeZone === btn.id
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400 scale-[1.02]"
                    : "bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800"
                } backdrop-blur-sm`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {activeZone !== "all" && (
            <button 
              onClick={() => setActiveZone("all")}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-4"
            >
              전체 방 보기
            </button>
          )}
        </motion.section>

        {/* Highlights Section */}
        <motion.section
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-10"
        >
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            제가 일하는 방식
          </h2>
          <div className="grid gap-6">
            {profileHighlights.map((card, index) => (
              <div key={card.title} className="group relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 md:p-8 transition-colors hover:bg-white/80 dark:hover:bg-zinc-900/80">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-4">
                  {card.index}
                </p>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                  {card.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack Section */}
        <motion.section
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-10"
        >
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            주로 다루는 기술
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {stackGroups.map((group) => (
              <div key={group.title} className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-lg shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Detailed Intro Section */}
        <motion.section
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-10 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-16"
        >
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            조금 더 깊은 이야기
          </h2>
          <div className="space-y-12">
            {introSections.map((point) => (
              <div key={point.title} className="space-y-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  {point.label}
                </p>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {point.title}
                </h3>
                <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
                  {point.body}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
