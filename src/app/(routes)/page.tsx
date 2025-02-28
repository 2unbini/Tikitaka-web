"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    setTimeout(() => {
      router.push("/form");
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col justify-center items-center bg-gray-200"
    >
      <main className="w-full max-w-md text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold mb-4"
        >
          티키타카
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-600 mb-8"
        >
          서로를 이해하는 대화의 시작
        </motion.p>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition-colors"
        >
          시작하기
        </motion.button>
      </main>
      <footer className="text-center text-sm text-gray-500 py-4">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
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
