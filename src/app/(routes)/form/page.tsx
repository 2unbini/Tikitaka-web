"use client";

import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  delay?: number;
}

interface Pet {
  name: string;
  type: string;
  age: number;
  gender: string;
  breed: string;
  personality: string[];
  friend: string[];
  favorite: string;
  dislike: string;
  image: string;
  description: string;
}

enum InformationType {
  name = "name",
  age = "age",
  type = "type",
  breed = "breed",
  gender = "gender",
  personality = "personality",
  friend = "friend",
  favorite = "favorite",
  dislike = "dislike",
  description = "description",
  checkInformation = "checkInformation",
}

const MessageList: {
  [key in InformationType]: string;
} = {
  [InformationType.name]: "먼저 너의 반려동물의 이름을 알려줘",
  [InformationType.age]: "와! 이름이 너무 멋진걸? 몇 살이야?",
  [InformationType.type]: "그렇구나. 어떤 동물이야?",
  [InformationType.breed]: "종이 있다면 알려줘. 하나뿐인 믹스도 얼마든지!",
  [InformationType.gender]: "성별은 어떻게 돼? 없다면 없음을 선택해줘.",
  [InformationType.personality]: "그럼 이제 성격에 대해 알려줄래?",
  [InformationType.friend]: "사람을 좋아해? 아니면 다른 동물 친구들을 좋아해?",
  [InformationType.favorite]:
    "또 좋아하는 것이 있어? 예를 들어 좋아하는 음식이나 좋아하는 장난감 등등",
  [InformationType.dislike]: "싫어하는건 어떤거야? 없다면 없다고 해도 좋아!",
  [InformationType.description]:
    "추가로 설명하고 싶은 것이 있어? 없으면 없다고 해도 돼.",
  [InformationType.checkInformation]:
    "너의 반려동물에 대한 정보가 맞는지 확인해줘.",
};

const GENDER_OPTIONS = ["남자", "여자", "중성화", "없음"];
const PERSONALITY_OPTIONS = [
  "활발한",
  "소심한",
  "애교많은",
  "독립적인",
  "사교적인",
  "겁많은",
  "용감한",
  "장난꾸러기",
  "차분한",
  "예민한",
];
const FRIEND_OPTIONS = ["사람", "같은 동물", "다른 동물", "혼자가 좋아"];

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm m-1 transition-colors ${
        selected
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

export default function InputField() {
  const router = useRouter();
  const informationType = useRef<InformationType>(InformationType.name);
  const [pet, setPet] = useState<Pet>({
    name: "",
    type: "",
    age: 0,
    gender: "",
    breed: "",
    personality: [],
    friend: [],
    favorite: "",
    dislike: "",
    image: "",
    description: "",
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "안녕 친구! 나는 티키타카야. 정보를 알려주면 반려동물과 대화할 수 있게 해줄게!",
      sender: "bot",
      delay: 0,
    },
    {
      id: 2,
      text: "먼저 너의 반려동물의 이름을 알려줄래?",
      sender: "bot",
      delay: 0.8,
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>(
    []
  );
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (informationType.current === InformationType.checkInformation) {
      setTimeout(() => {
        const petInfoMessage = `이름: ${pet.name}<br />나이: ${
          pet.age
        }살<br />종류: ${pet.type}<br />품종: ${pet.breed}<br />성별: ${
          pet.gender
        }<br />성격: ${pet.personality.join(
          ", "
        )}<br />좋아하는 친구: ${pet.friend.join(", ")}<br />좋아하는 것: ${
          pet.favorite
        }<br />싫어하는 것: ${pet.dislike}<br />추가 설명: ${pet.description}`;
        const petInfoBotMessage: Message = {
          id: messages.length + 2,
          text: petInfoMessage,
          sender: "bot",
        };
        setMessages((prev) => [...prev, petInfoBotMessage]);
      }, 1000);
    }
  }, [informationType.current]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserInput = (input: string) => {
    switch (informationType.current) {
      case InformationType.name:
        setPet((prev) => ({ ...prev, name: input }));
        informationType.current = InformationType.age;
        break;
      case InformationType.age:
        setPet((prev) => ({ ...prev, age: parseInt(input) || 0 }));
        informationType.current = InformationType.type;
        break;
      case InformationType.type:
        setPet((prev) => ({ ...prev, type: input }));
        informationType.current = InformationType.breed;
        break;
      case InformationType.breed:
        setPet((prev) => ({ ...prev, breed: input }));
        informationType.current = InformationType.gender;
        break;
      case InformationType.gender:
        setPet((prev) => ({ ...prev, gender: input }));
        informationType.current = InformationType.personality;
        break;
      case InformationType.personality:
        setPet((prev) => ({
          ...prev,
          personality: input.split(",").map((item) => item.trim()),
        }));
        informationType.current = InformationType.friend;
        break;
      case InformationType.friend:
        setPet((prev) => ({
          ...prev,
          friend: input.split(",").map((item) => item.trim()),
        }));
        informationType.current = InformationType.favorite;
        break;
      case InformationType.favorite:
        setPet((prev) => ({
          ...prev,
          favorite: input,
        }));
        informationType.current = InformationType.dislike;
        break;
      case InformationType.dislike:
        setPet((prev) => ({
          ...prev,
          dislike: input,
        }));
        informationType.current = InformationType.description;
        break;
      case InformationType.description:
        setPet((prev) => ({ ...prev, description: input }));
        informationType.current = InformationType.checkInformation;
        break;
      case InformationType.checkInformation:
        // 이 케이스는 이제 비워둡니다
        break;
    }
  };

  const sendMessage = () => {
    if (!input.trim()) {
      switch (informationType.current) {
        case InformationType.gender:
          const newUserGenderMessage: Message = {
            id: messages.length + 1,
            text: selectedGender,
            sender: "user",
          };
          setMessages([...messages, newUserGenderMessage]);
          break;
        case InformationType.personality:
          const newUserPersonalityMessage: Message = {
            id: messages.length + 1,
            text: selectedPersonalities.join(", "),
            sender: "user",
          };
          setMessages([...messages, newUserPersonalityMessage]);
          break;
        case InformationType.friend:
          const newUserFriendMessage: Message = {
            id: messages.length + 1,
            text: selectedFriends.join(", "),
            sender: "user",
          };
          setMessages([...messages, newUserFriendMessage]);
          break;
        default:
          return;
      }
    }

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };
    setMessages([...messages, newUserMessage]);
    handleUserInput(input);
    setInput("");

    setTimeout(() => {
      const botReply: Message = {
        id: messages.length + 2,
        text: MessageList[informationType.current],
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  const renderInputField = () => {
    switch (informationType.current) {
      case InformationType.gender:
        return (
          <div className="flex-1 flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
            {GENDER_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={selectedGender === option}
                onClick={() => {
                  setSelectedGender(option);
                  setPet((prev) => ({ ...prev, gender: option }));
                  const newUserMessage: Message = {
                    id: messages.length + 1,
                    text: option,
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, newUserMessage]);
                  setTimeout(() => {
                    informationType.current = InformationType.personality;
                    const botReply: Message = {
                      id: messages.length + 2,
                      text: MessageList[InformationType.personality],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                  }, 500);
                }}
              />
            ))}
          </div>
        );

      case InformationType.personality:
        return (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                {PERSONALITY_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={selectedPersonalities.includes(option)}
                    onClick={() => {
                      setSelectedPersonalities((prev) =>
                        prev.includes(option)
                          ? prev.filter((item) => item !== option)
                          : [...prev, option]
                      );
                    }}
                  />
                ))}
              </div>
            </div>
            {selectedPersonalities.length > 0 && (
              <button
                onClick={() => {
                  setPet((prev) => ({
                    ...prev,
                    personality: selectedPersonalities,
                  }));
                  const newUserMessage: Message = {
                    id: messages.length + 1,
                    text: selectedPersonalities.join(", "),
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, newUserMessage]);
                  setTimeout(() => {
                    informationType.current = InformationType.friend;
                    const botReply: Message = {
                      id: messages.length + 2,
                      text: MessageList[InformationType.friend],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                  }, 500);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                확인
              </button>
            )}
          </div>
        );

      case InformationType.friend:
        return (
          <div className="flex-1 flex items-center">
            <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {FRIEND_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={selectedFriends.includes(option)}
                  onClick={() => {
                    setSelectedFriends((prev) =>
                      prev.includes(option)
                        ? prev.filter((item) => item !== option)
                        : [...prev, option]
                    );
                  }}
                />
              ))}
            </div>
            {selectedFriends.length > 0 && (
              <button
                onClick={() => {
                  setPet((prev) => ({ ...prev, friend: selectedFriends }));
                  const newUserMessage: Message = {
                    id: messages.length + 1,
                    text: selectedFriends.join(", "),
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, newUserMessage]);
                  setTimeout(() => {
                    informationType.current = InformationType.favorite;
                    const botReply: Message = {
                      id: messages.length + 2,
                      text: MessageList[InformationType.favorite],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                  }, 500);
                }}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                확인
              </button>
            )}
          </div>
        );

      case InformationType.checkInformation:
        return (
          <div className="flex-1 flex items-center justify-center gap-4">
            <Chip
              label="수정하기"
              selected={false}
              onClick={() => {
                informationType.current = InformationType.name;
                const botReply: Message = {
                  id: messages.length + 1,
                  text: MessageList[InformationType.name],
                  sender: "bot",
                };
                setMessages((prev) => [...prev, botReply]);
              }}
            />
            <Chip
              label="완료하기"
              selected={false}
              onClick={() => {
                const completionMessage: Message = {
                  id: messages.length + 1,
                  text: "정보 입력 완료! 이제 대화를 시작해보자.",
                  sender: "bot",
                };
                setMessages((prev) => [...prev, completionMessage]);
                router.push(
                  `/chat?pet=${encodeURIComponent(JSON.stringify(pet))}`
                );
              }}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-2 border rounded-lg"
            placeholder="메시지를 입력하세요..."
          />
        );
    }
  };

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
            transition={{ delay: msg.delay ?? 0 }}
            className={`p-3 rounded-lg w-fit ${
              msg.sender === "bot"
                ? "bg-blue-200 mr-auto"
                : "bg-green-200 ml-auto"
            }`}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        ))}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 max-w-full">
          {renderInputField()}
          {informationType.current !== InformationType.gender &&
            informationType.current !== InformationType.personality &&
            informationType.current !== InformationType.friend &&
            informationType.current !== InformationType.checkInformation && (
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                보내기
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
