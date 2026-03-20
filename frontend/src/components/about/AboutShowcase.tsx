"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import AboutScene from "@/components/about/AboutScene";

const introPills = ["Frontend", "기록", "AI 활용"];

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

const workStyle = [
  "기능만 구현하는 것보다, 화면이 어떻게 읽히는지까지 함께 봅니다.",
  "처음부터 완벽하게 만들기보다 일단 만들고 계속 고쳐가는 쪽에 가깝습니다.",
  "새로운 기술은 블로그나 사이드 프로젝트에 직접 써보면서 익힙니다.",
];

export default function AboutShowcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section (Text Only) */}
      <section className="relative pt-20 pb-10 md:pt-32 md:pb-16 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-3 border border-zinc-900/10 bg-white/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 rounded-full">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            About Jack
          </div>

          <h1 className="text-[3rem] font-black leading-[1.1] tracking-tight md:text-[5rem] xl:text-[6rem] text-zinc-900 dark:text-zinc-50">
            안녕하세요,
            <br />
            Jack입니다.
          </h1>
          
          <p className="max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400 md:text-lg">
            화면을 설계하고 다듬는 일을 좋아합니다. 기능만 되는 것보다
            읽기 쉽고, 흐름이 자연스럽고, 다시 손대기 좋은 구조를 더
            좋아합니다. 이 페이지는 저를 소개하는 공간이지만, 동시에 제가
            화면을 다루는 방식이 자연스럽게 보이도록 만든 About이기도 합니다.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5 pt-4">
            {introPills.map((pill) => (
              <span
                key={pill}
                className="border border-zinc-900/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 rounded-full"
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              href="/posts"
              className="inline-flex items-center justify-center bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full"
            >
              글 보러가기
            </Link>
            <a
              href="https://github.com/jackihyun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-zinc-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 rounded-full"
            >
              GitHub
            </a>
            <a
              href="https://jackihyun.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-zinc-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 rounded-full"
            >
              Portfolio
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. 3D Room Showcase (Full Width / Large Block) */}
      <section className="px-4 md:px-8 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[60vh] min-h-[500px] max-h-[800px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-800"
        >
          <AboutScene reducedMotion={prefersReducedMotion} />
          
          <div className="absolute left-6 top-6 max-w-[280px] rounded-2xl border border-white/50 bg-white/60 px-5 py-4 text-zinc-800 backdrop-blur-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-200">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              My Routine Room
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              제가 좋아하는 작업, 독서, 운동 루틴을
              <br />
              디오라마(Diorama) 형태의 3D 방으로 구현했습니다.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 3. Content Grid */}
      <div className="mx-auto max-w-[1320px] px-4 md:px-8 xl:px-10 pt-10">
        <section className="grid gap-px border border-zinc-200/80 bg-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-800 lg:grid-cols-3 rounded-3xl overflow-hidden">
          {profileHighlights.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="bg-white px-8 py-10 dark:bg-[#090c10]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
                {card.index}
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400 md:text-base">
                {card.description}
              </p>
            </motion.article>
          ))}
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#090c10] rounded-3xl overflow-hidden"
          >
            <div className="border-b border-zinc-200/80 px-8 py-8 dark:border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
                Introduction
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                지금의 저를 조금 더 구체적으로 소개하면
              </h2>
            </div>
            <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
              {introSections.map((point) => (
                <div
                  key={point.title}
                  className="grid gap-4 px-8 py-8 md:grid-cols-[160px_1fr]"
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 pt-1">
                    {point.label}
                  </p>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {point.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-zinc-600 dark:text-zinc-400">
                      {point.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-8">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="border border-zinc-200/80 bg-[#fcf9f5] p-8 dark:border-zinc-800 dark:bg-[#10161d] rounded-3xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
                Tech Stack
              </p>
              <div className="mt-6 space-y-6">
                {stackGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-sm font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
                      {group.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="border border-zinc-900/10 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 rounded-lg"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="border border-zinc-200/80 bg-zinc-950 p-8 text-white dark:border-zinc-800 rounded-3xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                Work Style
              </p>
              <div className="mt-6 space-y-4">
                {workStyle.map((step, index) => (
                  <div
                    key={step}
                    className="border border-white/10 bg-white/[0.04] px-5 py-5 rounded-2xl"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                      Point 0{index + 1}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-zinc-200">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
