"use client";

import { motion } from "framer-motion";

export default function MyIntro() {
  return (
    <div className="py-8 space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          About Me
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          안녕하세요! Frontend를 좋아하는 개발자 Jack입니다.
        </p>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
      >
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
            새로운 경험을 좋아하고 프론트엔드 개발자를 꿈꾸는 Jack입니다.
          </h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              기술을 깊게 공부하는 것도 좋지만 저는 다양한 기술을 사용해보고
              프로덕트를 만드는 것이 더 재미있습니다. 새로운 기술을 접할 때마다 그
              기술의 가능성에 대해 궁금해하고, 이를 활용하여 무엇을 만들어낼 수
              있을지 고민합니다.
            </p>
            <p>
              명확하고 가독성 좋은 코드를 작성하는 것에 관심이 많으며, 정보를 공유하는 것에
              기쁨을 느낍니다. 컴퓨터 공학을 전공했고, 요즘은 프론트엔드 개발자를 꿈꾸며
              사용자에게 편리하고 즐거운 경험을 제공하는 프로덕트를 만들기 위해 노력하고 있습니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Skills Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest ">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Node.js"].map((skill) => (
            <span
              key={skill}
              className="px-4 py-2 text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Contact
        </h2>
        <div className="flex gap-4">
          <a
            href="https://github.com/jackihyun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </a>
          <a
            href="https://jackihyun.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
