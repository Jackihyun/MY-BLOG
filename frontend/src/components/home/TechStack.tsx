"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "React", accent: "from-cyan-400 to-sky-500", short: "Re" },
  { name: "TypeScript", accent: "from-blue-500 to-indigo-600", short: "TS" },
  { name: "TanStack Query", accent: "from-rose-500 to-orange-500", short: "TQ" },
  { name: "Next.js", accent: "from-zinc-700 to-zinc-950", short: "Nx" },
  { name: "Svelte", accent: "from-orange-500 to-red-500", short: "Sv" },
  { name: "JavaScript", accent: "from-amber-300 to-yellow-500", short: "JS" },
  { name: "TailwindCSS", accent: "from-cyan-400 to-teal-500", short: "Tw" },
  { name: "Vite", accent: "from-violet-500 to-indigo-500", short: "Vi" },
  { name: "HTML", accent: "from-orange-500 to-pink-500", short: "Ht" },
  { name: "CSS", accent: "from-sky-500 to-blue-600", short: "Cs" },
  { name: "Java", accent: "from-red-500 to-amber-500", short: "Ja" },
  { name: "Spring", accent: "from-emerald-500 to-lime-500", short: "Sp" },
  { name: "MySQL", accent: "from-blue-400 to-cyan-600", short: "My" },
];

export default function TechStack() {
  // 무한 루프를 위해 배열을 여러 번 복제합니다.
  const doubledStack = [...technologies, ...technologies, ...technologies];

  return (
    <section className="py-24 overflow-hidden w-full">
      <div className="mx-auto px-4 mb-12">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight uppercase flex items-center gap-3">
          Tech Stack
        </h2>
      </div>

      <div className="relative w-full flex overflow-hidden">
        {/* 무한 슬라이드 컨테이너 */}
        <motion.div
          className="flex whitespace-nowrap gap-4 py-4 px-4"
          animate={{
            x: ["0%", "-33.33%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {doubledStack.map((tech, index) => (
            <div
              key={`${tech.name}-${index}`}
              className="flex-shrink-0 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 group"
            >
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tech.accent} text-[11px] font-black text-white shadow-sm`}
                aria-hidden="true"
              >
                {tech.short}
              </div>
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* 좌우 그라데이션 페이드 효과 */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 dark:from-[#030303] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 dark:from-[#030303] to-transparent z-10" />
      </div>
    </section>
  );
}
