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
      "단순히 예쁜 화면보다, 사용자가 자연스럽게 읽고 다음 행동으로 이어지게 만드는 인터페이스를 좋아합니다. 정보 구조, 타이포 리듬, 인터랙션 타이밍까지 한 흐름으로 설계하려고 합니다.",
  },
  {
    index: "02",
    title: "만들면서 배우는 편입니다",
    description:
      "문서를 읽는 것에서 멈추기보다, 실제 기능을 붙이고 실패를 기록하면서 익힙니다. 작게 만들고 빠르게 검증한 뒤 개선하는 방식이 제일 잘 맞아서, 실험적인 페이지를 자주 만들고 회고합니다.",
  },
  {
    index: "03",
    title: "배운 건 남겨두려고 합니다",
    description:
      "정리하지 않으면 금방 잊는 편이라, 글과 코드 조각으로 반드시 남깁니다. 나중에 다시 읽었을 때 바로 재사용할 수 있는 형태를 목표로 기록합니다.",
  },
  {
    index: "04",
    title: "협업 가능한 코드가 목표입니다",
    description:
      "혼자만 이해하는 코드보다, 다음 사람이 이어서 고칠 수 있는 코드가 더 중요하다고 생각합니다. 네이밍, 분리 기준, 문서화, 예외 처리까지 팀 기준으로 맞추려 합니다.",
  },
];

const introSections = [
  {
    label: "요즘의 저",
    title:
      "프론트엔드를 중심으로, 백엔드와 AI 활용까지 조금씩 넓혀가고 있습니다",
    body: "가장 재미를 느끼는 영역은 여전히 프론트엔드입니다. React, Next.js, TypeScript를 중심으로 복잡한 화면 상태를 단순하게 다루는 방법에 관심이 많습니다. 동시에 Spring Boot와 API 설계도 함께 다뤄서 화면-서버-데이터 흐름을 한 번에 이해하려고 합니다. 최근에는 AI 도구를 단순 자동완성 수준이 아니라, 콘텐츠 정리·코드 리뷰·반복 작업 자동화까지 연결해 실제 생산성을 올리는 실험을 꾸준히 하고 있습니다.",
  },
  {
    label: "블로그를 하는 이유",
    title: "배운 걸 흘려보내지 않으려고 씁니다",
    body: "배운 내용을 바로 정리하지 않으면 지식이 금방 끊긴다는 걸 자주 느꼈습니다. 그래서 기능 구현 과정에서 고민했던 선택 기준, 실패했던 접근, 최종적으로 채택한 구조까지 함께 기록합니다. 누군가에게 도움이 되면 가장 좋고, 동시에 미래의 제가 다시 참고할 수 있는 개발 노트 역할도 하도록 운영하고 있습니다.",
  },
  {
    label: "중요하게 보는 것",
    title: "읽기 쉽고, 자연스럽고, 오래 다듬을 수 있는 화면",
    body: "처음 보는 사용자도 막히지 않는 흐름, 반복 사용해도 피로하지 않은 상호작용, 그리고 시간이 지나도 유지보수 가능한 구조를 중요하게 봅니다. 과한 장식보다 맥락이 전달되는 밀도와 균형을 더 우선합니다. 이 About 페이지도 3D를 단순한 시각 요소로 쓰지 않고, 글의 맥락과 움직임이 서로 어긋나지 않게 맞추는 데 초점을 두었습니다.",
  },
];

const stackGroups = [
  {
    title: "주로 쓰는 기술",
    items: ["React", "Next.js(App Router)", "TypeScript", "Tailwind CSS", "TanStack Query"],
  },
  {
    title: "표현을 더할 때",
    items: ["Framer Motion", "Three.js", "R3F", "Shadcn/UI", "Tiptap"],
  },
  {
    title: "함께 넓혀가는 영역",
    items: ["Spring Boot", "JPA", "SQLite", "Performance", "SEO", "Web Vitals"],
  },
];

const currentFocus = [
  {
    title: "UX 안정화",
    body: "로딩/에러/빈 상태를 먼저 설계해서 화면이 흔들리지 않게 만드는 작업에 집중하고 있습니다.",
  },
  {
    title: "성능 개선",
    body: "필요한 곳만 클라이언트 컴포넌트로 두고, 렌더 비용이 큰 인터랙션은 분리해 체감 속도를 개선하고 있습니다.",
  },
  {
    title: "콘텐츠 시스템",
    body: "글 작성, 썸네일, SEO 메타데이터를 일관되게 관리할 수 있게 블로그 파이프라인을 정리하고 있습니다.",
  },
];

export default function AboutShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const [activeZone, setActiveZone] = useState<ActiveZone>("all");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-transparent">
      {/* Left Column: 3D Scene (Sticky) */}
      {/* h-screen과 sticky를 사용하여 스크롤 시에도 완벽하게 고정되도록 수정 (상하 여백으로 인한 흔들림 방지) */}
      <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.03),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* 3D Canvas Container */}
        <div className="absolute inset-0 w-full h-full">
          <AboutScene
            reducedMotion={reducedMotion}
            activeZone={activeZone}
            onZoneClick={setActiveZone}
          />
        </div>

        <div className="absolute left-6 top-6 lg:left-10 lg:top-10 pointer-events-none z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Interactive Room
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            손흔들기/코딩/쇼파/운동 지점을 클릭해보세요.
          </p>
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
          <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-black leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-50">
            안녕하세요,
            <br />
            Jack입니다.
          </h1>

          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            화면을 설계하고 다듬는 일을 좋아합니다. 기능만 되는 것보다 읽기
            쉽고, 흐름이 자연스럽고, 다시 손대기 좋은 구조를 더 좋아합니다. 이
            페이지는 저를 소개하는 공간이지만, 동시에 제가 화면을 다루는 방식이
            자연스럽게 보이도록 만든 About이기도 합니다.
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

        <motion.section
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            요즘 집중하는 것
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {currentFocus.map((focus) => (
              <div
                key={focus.title}
                className="bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5"
              >
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {focus.title}
                </h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {focus.body}
                </p>
              </div>
            ))}
          </div>
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
              <div
                key={card.title}
                className="group relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 md:p-8 transition-colors hover:bg-white/80 dark:hover:bg-zinc-900/80"
              >
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
              <div
                key={group.title}
                className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6"
              >
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
