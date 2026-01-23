"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "React", icon: "⚛️", color: "from-blue-400 to-blue-600" },
  { name: "Next.js", icon: "▲", color: "from-gray-600 to-gray-900" },
  { name: "TypeScript", icon: "TS", color: "from-blue-500 to-blue-700" },
  { name: "Tailwind", icon: "🎨", color: "from-cyan-400 to-cyan-600" },
  { name: "Node.js", icon: "🟢", color: "from-green-500 to-green-700" },
  { name: "Spring", icon: "🍃", color: "from-green-400 to-green-600" },
];

export default function TechStack() {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          기술 스택
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          주로 사용하는 기술들입니다
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`
              flex items-center gap-3 px-5 py-3
              bg-gradient-to-r ${tech.color}
              text-white font-medium rounded-xl
              shadow-lg cursor-default
              transition-shadow hover:shadow-xl
            `}
          >
            <span className="text-xl">{tech.icon}</span>
            <span>{tech.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Decorative element */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm">
            More coming soon...
          </span>
        </div>
      </div>
    </section>
  );
}
