"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "안녕! 나는 김밥이야! 🐶 나한테 대해 알려줄래?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };
    setMessages([...messages, newUserMessage]);
    setInput("");

    setTimeout(() => {
      const botReply: Message = {
        id: messages.length + 2,
        text: "와! 정말 신기한 이야기야! 🐾",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-500 text-white p-4 text-center text-lg font-bold">
        🐾 티키타카
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg w-fit ${
              msg.sender === "bot"
                ? "bg-blue-200 mr-auto"
                : "bg-green-200 ml-auto"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="p-4 flex items-center bg-white border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded-lg"
          placeholder="메시지를 입력하세요..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          보내기
        </button>
      </div>
    </div>
  );
}
