"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const technologies = [
  { name: "React", icon: "https://api.iconify.design/logos:react.svg" },
  { name: "TypeScript", icon: "https://api.iconify.design/logos:typescript-icon.svg" },
  { name: "Tanstack-Query", icon: "https://api.iconify.design/logos:react-query-icon.svg" },
  { name: "Next.js", icon: "https://api.iconify.design/logos:nextjs-icon.svg" },
  { name: "Svelte", icon: "https://api.iconify.design/logos:svelte-icon.svg" },
  { name: "JavaScript", icon: "https://api.iconify.design/logos:javascript.svg" },
  { name: "TailwindCSS", icon: "https://api.iconify.design/logos:tailwindcss-icon.svg" },
  { name: "Vite", icon: "https://api.iconify.design/logos:vitejs.svg" },
  { name: "HTML", icon: "https://api.iconify.design/logos:html-5.svg" },
  { name: "CSS", icon: "https://api.iconify.design/logos:css-3.svg" },
  { name: "Java", icon: "https://api.iconify.design/logos:java.svg" },
  { name: "Spring", icon: "https://api.iconify.design/logos:spring-icon.svg" },
  { name: "MySQL", icon: "https://api.iconify.design/logos:mysql-icon.svg" },
];

export default function TechStack() {
  // 무한 루프를 위해 배열을 여러 번 복제합니다.
  const doubledStack = [...technologies, ...technologies, ...technologies];

  return (
    <section className="py-24 overflow-hidden w-full">
      <div className="max-w-5xl mx-auto px-4 mb-12">
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
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 relative">
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  fill
                  className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                />
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
