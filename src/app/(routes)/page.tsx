"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  const handleStart = () => {
    if (userName.trim()) {
      router.push(`/form?userName=${encodeURIComponent(userName.trim())}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-white"
    >
      <main className="w-full max-w-md text-center px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mb-12"
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            티키타카
          </h1>
          <p className="text-gray-600 text-xl font-medium">
            서로를 이해하는 대화의 시작
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: 2.0,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mb-12 space-y-2 text-gray-500 text-sm"
        >
          <p>반려동물과 더 깊은 교감을 나누고 싶으신가요?</p>
          <p>AI 기술로 반려동물의 마음을 이해하고</p>
          <p>특별한 대화를 시작해보세요 🐾</p>
        </motion.div>

        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: 3.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="bg-white rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.05)]"
        >
          <div className="flex flex-col items-center">
            <label className="self-start mb-2 text-xs px-1 font-light text-gray-800">
              반려동물이 당신을 부르는 이름을 입력해주세요.
            </label>
            <div className="w-full flex flex-col items-center space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="예) 누나, 아빠, 은빈"
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 placeholder:text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
              <button
                onClick={handleStart}
                disabled={!userName.trim()}
                className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all transform
                  ${
                    userName.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600/95 hover:scale-[1.01] active:scale-[0.99]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } shadow-sm`}
              >
                {userName.trim() ? `시작하기` : "입력하고 시작하기"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      <footer className="fixed bottom-0 w-full text-center text-sm text-gray-400 py-6">
        <a
          className="flex items-center justify-center gap-2 hover:text-gray-600 transition-colors"
          href="https://marble-border-52d.notion.site/Where-All-Belong-Belonging-03ac1be004554b1ebb7bec887c167524?pvs=4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Where all belong
        </a>
      </footer>
    </motion.div>
  );
}
