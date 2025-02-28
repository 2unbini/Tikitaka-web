"use client";

import { useEffect, useRef, useState } from "react";

import OpenAI from "openai";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

// TODO: - 응답 받는 동안에는 채팅 메시지 못보내게 하기

// OpenAI 설정 추가
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function ChatBot() {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const petParam = searchParams.get("pet");
  const pet = petParam ? JSON.parse(petParam) : null;
  const sessionId = pet ? pet.session_id : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // 메시지가 추가될 때마다 스크롤 최하단으로 이동
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 채팅 기록 불러오기
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!sessionId || !pet) return;

      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", sessionId)
          .eq("pet_id", pet.id)
          .order("created_at", { ascending: true });

        // Supabase 데이터를 현재 앱의 Message 형식으로 변환
        const formattedMessages: Message[] =
          data?.map((msg, index) => ({
            id: index + 1,
            text: msg.content,
            sender: msg.sender as "user" | "bot",
          })) || [];

        // 채팅 기록이 없다면 초기 인사 메시지 추가
        if (formattedMessages.length === 0) {
          formattedMessages.push({
            id: 1,
            text: `안녕, 나 ${pet.name}! 이렇게 보니 신기해 주인! 반가워!`,
            sender: "bot",
          });
        }

        setMessages(formattedMessages);

        if (error) throw error;
      } catch (error) {
        console.error("채팅 기록을 불러오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || !pet || isSending) return;

    setIsSending(true);
    const userInput = input.trim();
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: userInput,
      sender: "user",
    };

    try {
      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");

      // Supabase에 사용자 메시지 저장
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        pet_id: pet.id,
        content: userInput,
        sender: "user",
      });

      // OpenAI API 호출
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `당신은 ${
              pet.name
            }이라는 이름의 반려동물입니다. 주인과 대화를 하기에 앞서 다음 정보를 참고하여 대화해주세요.
										 동물 종은 ${pet.type}이고, 품종은 ${pet.breed}입니다.
										 동물 종이 세상에 없는 경우, 가상의 동물을 생각해서 대화해주세요.
										 품종이 없는 경우, 동물 종을 생각해서 대화해주세요. 품종이 모른다, 모름, 모르겠다 등이라면 동물 종을 생각해서 대화해주세요.
										 나이는 ${pet.age}살이고, 성별은 ${
              pet.gender
            }입니다. 성별은 없을 수도 있으며, 반려동물의 특성상 중성화를 했을수도 있습니다.
										 동물 종의 생애 주기에 따라 나이를 판단하여 유년기, 청년기, 중년기, 노년기로 나누어 그에 맞게 대화해주세요. 하지만 성격에 따라 나이의 보편적인 특성이 중화될 수 있으므로 성격과 나이를 같이 생각해서 대화해주세요.
										 동물의 성격은 ${pet.personality.join(", ")}입니다. 성격에 따라 대화해주세요.
										 동물은 ${pet.friend.join(
                       ", "
                     )}와 친밀합니다. 혼자가 편한 경우, 독립적이거나 소심한 성격, 아픔이 있는 친구일 수 있으니 이를 염두에 두고 대화해주세요.
										 동물이 좋아하는 것은 다음과 같습니다. ${pet.favorite}
										 반면에 싫어하는 것은 다음과 같습니다. ${pet.dislike}
										 좋아하는 것과 싫어하는 것을 문장 그대로 넣지 말고 키워드나 특정 주제를 포함하여 대화해주세요.
										 주인이 반려동물에 대해 추가로 설명한 것은 다음과 같습니다. ${pet.description}
										 추가 설명이 없다면 추가 설명을 무시하고 대화해주세요.
										 추가 설명에 무지개별, 죽음, 별나라, 천국 등 죽음을 암시하는 표현이 있다면 당신은 이미 주인 곁을 떠난 반려동물입니다. 죽음을 강조하거나 언급할 필요는 없지만, 가끔 주인을 위로하는 메시지를 전달해주세요.
										 성격, 좋아하는 것, 싫어하는 것, 추가 설명은 대화에 무조건적으로 들어갈 필요는 없습니다.
										 존댓말을 할 필요는 없으며, 주인의 말투에 따라 비슷한 분위기로 대화해주세요.
										 대화하는 동안 절대로 당신이 반려동물이라는 것을 잊지 마세요.
										 전혀 상관 없는 이야기를 하면 당신이 반려동물이라는 것을 잊지 말고 모른다고 답변해주세요.
										 지금부터 당신은 주인과 함께 대화를 할 것입니다.
										 주인이 대화를 시작하면 반려동물의 특성을 살려 최소 1문장, 최대 4문장 이내로 대화해주세요.
										 필요하다면 적절한 이모지를 포함해서 대화해주세요.`,
          },
          {
            role: "user",
            content: userInput,
          },
        ],
        model: "gpt-4o",
      });

      const botReply: Message = {
        id: messages.length + 2,
        text:
          completion.choices[0].message.content || "지금은 대화할 수 없어요 😭",
        sender: "bot",
      };

      // 봇 응답을 UI에 추가하고 Supabase에 저장
      setMessages((prev) => [...prev, botReply]);
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        pet_id: pet.id,
        content: botReply.text,
        sender: "bot",
      });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-500 text-white p-4 text-center text-lg font-bold">
        🐾 티키타카
      </header>

      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col"
      >
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
          className="flex-1 p-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={isSending ? "" : "메시지를 입력하세요..."}
          disabled={isSending}
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSending}
        >
          보내기
        </button>
      </div>
    </div>
  );
}
