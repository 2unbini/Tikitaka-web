"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Alert from "@/app/components/Alert";
import Feedback from "@/app/components/Feedback";
import OpenAI from "openai";
import { chatPrompt } from "@/constants/prompt";
import { feedbackService } from "@/services/feedbackService";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { usePet } from "@/hooks/usePet";
import { useSession } from "@/hooks/useSession";

const MAX_MESSAGE_COUNT = 10;

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function ChatBotContent() {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const param = useSearchParams();
  const sessionId = useSession();
  const { pet, isLoading: isPetLoading } = usePet(param.get("petId"));
  const {
    messages,
    isLoading: isMessagesLoading,
    createMessage,
  } = useChat(param.get("sessionId"), param.get("petId"));
  const router = useRouter();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messageCount, setMessageCount] = useState(
    () => messages?.filter((msg) => msg.sender === "user").length || 0
  );
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // 메시지가 추가될 때마다 스크롤 최하단으로 이동
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add an effect to update the count when messages change
  useEffect(() => {
    if (messages) {
      setMessageCount(messages.filter((msg) => msg.sender === "user").length);
    }
  }, [messages]);

  const isSharedChat = Boolean(
    param.get("sessionId") &&
      param.get("petId") &&
      param.get("sessionId") !== sessionId
  );

  const sendMessage = async () => {
    if (isSharedChat || !input.trim() || !sessionId || !pet || isSending) {
      return;
    }

    const newMessageCount = messageCount + 1;
    setMessageCount(newMessageCount);

    if (newMessageCount === MAX_MESSAGE_COUNT) {
      setShowAlert(true);
      return;
    }

    setIsSending(true);
    const userInput = input.trim();

    try {
      // Save user message
      createMessage({
        session_id: sessionId,
        pet_id: pet.id,
        content: userInput,
        sender: "user",
      });

      setInput("");

      // Get AI response
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: chatPrompt(pet),
          },
          {
            role: "user",
            content: userInput,
          },
        ],
        model: "gpt-4",
      });

      const botReply = completion.choices[0].message.content;

      if (botReply === null) {
        alert("메시지를 받아오는데 실패했어요😢 다시 시도해주세요.");
      } else {
        // Save bot message
        createMessage({
          session_id: sessionId,
          pet_id: pet.id,
          content: botReply,
          sender: "bot",
        });
      }
    } catch {
      alert("메시지 전송에 실패했어요😢 다시 시도해주세요.");
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = async () => {
    if (!isSharedChat) {
      try {
        const existingFeedback = await feedbackService.getFeedbackBySessionId(
          sessionId || ""
        );
        if (existingFeedback) {
          router.push("/");
        } else {
          setShowFeedback(true);
        }
      } catch {
        // If there's an error checking feedback, show the feedback form anyway
        setShowFeedback(true);
      }
    } else {
      router.push("/");
    }
  };

  const handleCopyConversation = async () => {
    const currentUrl =
      window.location.href + "?sessionId=" + sessionId + "&petId=" + pet?.id;
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert("대화 링크가 복사되었습니다!");
    } catch {
      alert("링크 복사에 실패했어요😢 다시 시도해주세요.");
    }
    setShowShareMenu(false);
  };

  const handleCopyServiceUrl = async () => {
    const rootUrl = window.location.origin;
    try {
      await navigator.clipboard.writeText(rootUrl);
      alert("서비스 링크가 복사되었습니다!");
    } catch {
      alert("링크 복사에 실패했어요😢 다시 시도해주세요.");
    }
    setShowShareMenu(false);
  };

  const handleContact = () => {
    const subject = encodeURIComponent("티키타카 문의하기🐾");
    const body = encodeURIComponent(
      "안녕하세요, 티키타카입니다.\n\n" +
        "서비스 관련하여 궁금한 점이나 개선 사항을 아래에 자유롭게 적어주세요!\n\n" +
        "---\n"
    );
    window.location.href = `mailto:where.all.belong@gmail.com?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".relative")) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isPetLoading || isMessagesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 prevent-overscroll">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="font-semibold text-gray-800">
            {pet?.name || "티키타카"}
          </h1>
          <span className="text-xs text-gray-500">반려동물과의 대화 🐾</span>
        </div>
        <div className="w-6 flex justify-end relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="text-blue-500 hover:text-blue-600 transition-colors"
            aria-label="공유 메뉴"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {showShareMenu && (
            <div className="absolute right-0 top-8 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {!isSharedChat && (
                  <>
                    <button
                      onClick={handleCopyConversation}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      채팅방 공유하기
                    </button>
                    <button
                      onClick={handleCopyServiceUrl}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      서비스 공유하기
                    </button>
                  </>
                )}
                <button
                  onClick={handleContact}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  문의하기
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col text-gray-800"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 w-full"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center text-white text-sm">
            {pet?.image ? (
              <img
                src={pet.image}
                alt="Pet profile"
                className="w-full h-full object-cover"
              />
            ) : (
              "🐾"
            )}
          </div>
          <div className="p-3 rounded-2xl max-w-[70%] text-sm bg-blue-200">
            안녕, 나 {pet?.name}! 이렇게 보니 신기해 {pet?.owner_name}! 잘
            지냈어?
          </div>
        </motion.div>
        {messages &&
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 w-full"
              style={{
                margin: "8px 0",
                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              {msg.sender === "bot" && (
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center text-white text-sm">
                  {pet?.image ? (
                    <img
                      src={pet.image}
                      alt="Pet profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "🐾"
                  )}
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[70%] text-sm ${
                  msg.sender === "bot" ? "bg-blue-200" : "bg-gray-200 ml-auto"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
      </div>
      {messageCount < MAX_MESSAGE_COUNT && (
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // 새로고침 방지
              sendMessage(); // 함수 실행
            }}
            className="p-4 flex items-center gap-2 bg-white border-t"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-10 px-3 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-sm text-gray-800"
              placeholder={
                isSharedChat
                  ? "공유된 대화방은 메시지를 보낼 수 없어요"
                  : isSending
                  ? "답변을 기다리고 있어요..."
                  : "메시지를 입력하세요..."
              }
              disabled={isSending || isSharedChat}
            />
            <button
              type="submit"
              className="h-10 px-2 bg-blue-500 text-white rounded-lg text-sm whitespace-nowrap hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSending || isSharedChat}
            >
              보내기
            </button>
          </form>
        </div>
      )}

      <Alert
        isOpen={showAlert}
        onClose={async () => {
          setShowAlert(false);
          try {
            const existingFeedback =
              await feedbackService.getFeedbackBySessionId(sessionId || "");
            if (!existingFeedback) {
              setShowFeedback(true);
            } else {
              router.push("/");
            }
          } catch {
            setShowFeedback(true);
          }
        }}
      />

      <Feedback
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        sessionId={sessionId || ""}
        petId={pet?.id || ""}
        onSubmit={() => router.push("/")}
      />
    </div>
  );
}

export default function ChatBot() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      }
    >
      <ChatBotContent />
    </Suspense>
  );
}
