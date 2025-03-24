"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Message } from "@/types/message";
import { Pet } from "@/types/pet";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { usePet } from "@/hooks/usePet";
import { useSession } from "@/hooks/useSession";

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
  image = "image",
  description = "description",
  checkInformation = "checkInformation",
}

const MessageList: {
  [key in InformationType]: string;
} = {
  [InformationType.name]: "대화하고 싶은 반려동물의 이름이 뭐야?",
  [InformationType.age]: "와! 이름이 너무 멋진걸? 몇 살이야?",
  [InformationType.type]: "그렇구나. 어떤 동물이야?",
  [InformationType.breed]: "종이 있다면 알려줘. 하나뿐인 믹스도 얼마든지!",
  [InformationType.gender]: "성별은 어떻게 돼? 없다면 없음을 선택해 줘.",
  [InformationType.image]: "혹시 사진 있어? 없다면 넘어가도 좋아.",
  [InformationType.personality]: "그러면 이제 성격에 대해 알려줄래?",
  [InformationType.friend]: "사람을 좋아해? 아니면 다른 동물 친구들을 좋아해?",
  [InformationType.favorite]:
    "또 좋아하는 것이 있어? 예를 들어 좋아하는 음식이나 좋아하는 장난감 등등",
  [InformationType.dislike]: "싫어하는 건 어떤거야? 없다면 없다고 해도 좋아!",
  [InformationType.description]:
    "추가로 설명하고 싶은 것이 있어? 추억이나 특별한 이야기 등등... 없으면 없다고 해도 돼.",
  [InformationType.checkInformation]:
    "너의 반려동물에 대한 정보가 맞는지 확인해 줘.",
};

const PlaceholderList = {
  [InformationType.name]: "예) 토토, 도리, 호떡이 등",
  [InformationType.age]: "예) 1살, 8개월, 6년 등",
  [InformationType.type]: "예) 강아지, 고양이, 도마뱀 등",
  [InformationType.breed]: "예) 포메라니안, 블루화이트, 믹스 등",
  [InformationType.gender]: "예) 남자, 여자, 중성화, 없음",
  [InformationType.image]: "예) 토토의 사진, 도리의 사진, 호떡이의 사진 등",
  [InformationType.personality]:
    "예) 활발한, 소심한, 애교많은, 독립적인, 사교적인, 겁많은, 용감한, 장난꾸러기, 차분한, 예민한",
  [InformationType.friend]: "예) 사람, 같은 동물, 다른 동물, 혼자가 좋아",
  [InformationType.favorite]: "예) 수박 껍질, 터그 놀이, 주인 빼고 다 등",
  [InformationType.dislike]: "예) 사람 손길, 당근, 다른 동물 등",
  [InformationType.description]: "예) 무지개별, 개냥이, 보호소 출신 등",
  [InformationType.checkInformation]: "정보가 맞는지 확인해줘.",
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
  "게으른",
  "호기심 많은",
  "까칠한",
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
      className={`px-4 py-2 rounded-2xl text-xs m-1 transition-colors ${
        selected
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function InputFieldContent() {
  const router = useRouter();
  const { pet, isLoading: isPetLoading, createPet } = usePet();
  const sessionId = useSession();
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName");
  const informationType = useRef<InformationType>(InformationType.name);
  const [petData, setPetData] = useState<Pet>({
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
    session_id: sessionId || "",
    owner_name: userName || "주인",
  });
  const messageIdRef = useRef(2);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>(
    []
  );
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // If pet is already created, redirect to chat page
  useEffect(() => {
    const setInitialMessage = () => {
      setMessages([
        {
          id: 1,
          text: `안녕 ${userName}! 나는 벨롱이야. 반려동물의 정보를 차근차근 알려줄래?`,
          sender: "bot",
          delay: 0,
        },
        {
          id: 2,
          text: "대화하고 싶은 반려동물의 이름이 뭐야?",
          sender: "bot",
          delay: 0.8,
        },
      ]);
    };

    if (pet) {
      new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/chat");
    } else {
      setInitialMessage();
    }
  }, [pet, router, userName]);

  useEffect(() => {
    if (informationType.current === InformationType.checkInformation) {
      setTimeout(() => {
        const petInfoMessage = `이름: ${petData.name}<br />나이: ${
          petData.age
        }살<br />종류: ${petData.type}<br />품종: ${petData.breed}<br />성별: ${
          petData.gender
        }<br />성격: ${petData.personality.join(
          ", "
        )}<br />좋아하는 친구: ${petData.friend.join(", ")}<br />좋아하는 것: ${
          petData.favorite
        }<br />싫어하는 것: ${petData.dislike}<br />추가 설명: ${
          petData.description
        }`;
        const petInfoBotMessage: Message = {
          id: ++messageIdRef.current,
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

  useEffect(() => {
    if (pet) {
      router.push("/chat");
    }
  }, [pet, router]);

  const handleUserInput = (input: string) => {
    switch (informationType.current) {
      case InformationType.name:
        setPetData((prev) => ({ ...prev, name: input }));
        informationType.current = InformationType.age;
        break;
      case InformationType.age:
        if (input.includes("개월")) {
          setPetData((prev) => ({ ...prev, age: 0 }));
        } else {
          setPetData((prev) => ({ ...prev, age: parseInt(input) || 0 }));
        }
        informationType.current = InformationType.type;
        break;
      case InformationType.type:
        setPetData((prev) => ({ ...prev, type: input }));
        informationType.current = InformationType.breed;
        break;
      case InformationType.breed:
        setPetData((prev) => ({ ...prev, breed: input }));
        informationType.current = InformationType.gender;
        break;
      case InformationType.gender:
        setPetData((prev) => ({ ...prev, gender: input }));
        informationType.current = InformationType.image;
        break;
      case InformationType.image:
        setPetData((prev) => ({ ...prev, image: input }));
        informationType.current = InformationType.personality;
        break;
      case InformationType.personality:
        setPetData((prev) => ({
          ...prev,
          personality: input.split(",").map((item) => item.trim()),
        }));
        informationType.current = InformationType.friend;
        break;
      case InformationType.friend:
        setPetData((prev) => ({
          ...prev,
          friend: input.split(",").map((item) => item.trim()),
        }));
        informationType.current = InformationType.favorite;
        break;
      case InformationType.favorite:
        setPetData((prev) => ({
          ...prev,
          favorite: input,
        }));
        informationType.current = InformationType.dislike;
        break;
      case InformationType.dislike:
        setPetData((prev) => ({
          ...prev,
          dislike: input,
        }));
        informationType.current = InformationType.description;
        break;
      case InformationType.description:
        setPetData((prev) => ({ ...prev, description: input }));
        informationType.current = InformationType.checkInformation;
        break;
      case InformationType.checkInformation:
        // 이 케이스는 이제 비워둡니다
        break;
    }
  };

  const handleComplete = async () => {
    const completionMessage: Message = {
      id: ++messageIdRef.current,
      text: "정보 입력 완료! 이제 대화를 시작해보자.",
      sender: "bot",
    };
    setMessages((prev) => [...prev, completionMessage]);

    try {
      if (sessionId) {
        createPet({
          ...petData,
          session_id: sessionId,
          owner_name: userName || "주인",
        });
        router.push("/chat");
      } else {
        alert("세션 ID가 없어요😭 다시 시도해주세요.");
        router.refresh();
      }
    } catch {
      alert("반려동물 정보 저장에 실패했어요😢 다시 시도해주세요.");
      router.refresh();
    }
  };

  const sendMessage = () => {
    if (!input.trim()) {
      switch (informationType.current) {
        case InformationType.gender:
          const newUserGenderMessage: Message = {
            id: ++messageIdRef.current,
            text: selectedGender,
            sender: "user",
          };
          setMessages([...messages, newUserGenderMessage]);
          break;
        case InformationType.personality:
          const newUserPersonalityMessage: Message = {
            id: ++messageIdRef.current,
            text: selectedPersonalities.join(", "),
            sender: "user",
          };
          setMessages([...messages, newUserPersonalityMessage]);
          break;
        case InformationType.friend:
          const newUserFriendMessage: Message = {
            id: ++messageIdRef.current,
            text: selectedFriends.join(", "),
            sender: "user",
          };
          setMessages([...messages, newUserFriendMessage]);
          break;
        case InformationType.image:
          if (petData.image) {
            const newUserImageMessage: Message = {
              id: ++messageIdRef.current,
              text: "사진이 등록됐어요!",
              sender: "user",
              image: petData.image,
            };
            setMessages([...messages, newUserImageMessage]);
          }
          break;
        default:
          return;
      }
    }

    const newUserMessage: Message = {
      id: ++messageIdRef.current,
      text: input,
      sender: "user",
    };
    setMessages([...messages, newUserMessage]);
    handleUserInput(input);
    setInput("");

    setTimeout(() => {
      const botReply: Message = {
        id: ++messageIdRef.current,
        text: MessageList[informationType.current],
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 5MB 이상의 파일 업로드 방지
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 로딩 메시지 추가
      const loadingMessage: Message = {
        id: ++messageIdRef.current,
        text: "사진을 업로드하고 있어 💓",
        sender: "bot",
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // 고유한 파일명 생성
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `pet_images/${fileName}`;

      // Supabase Storage에 업로드
      const { error } = await supabase.storage
        .from("pets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false, // 기존 파일 덮어쓰기 방지
        });

      if (error) throw error;

      // 업로드된 이미지의 퍼블릭 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("pets").getPublicUrl(filePath);

      // 상태 업데이트
      setPetData((prev) => ({ ...prev, image: publicUrl }));

      // 기존 로딩 메시지 제거 후 성공 메시지 추가
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
      const successMessage: Message = {
        id: ++messageIdRef.current,
        text: "사진이 잘 등록됐어!",
        sender: "user",
        image: publicUrl,
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch {
      const errorMessage: Message = {
        id: ++messageIdRef.current,
        text: "사진 업로드에 실패했어😞 다시 시도해줄래?",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setPetData((prev) => ({ ...prev, image: "" }));
    }
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
                  setPetData((prev) => ({ ...prev, gender: option }));
                  const newUserMessage: Message = {
                    id: ++messageIdRef.current,
                    text: option,
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, newUserMessage]);
                  setTimeout(() => {
                    informationType.current = InformationType.image;
                    const botReply: Message = {
                      id: ++messageIdRef.current,
                      text: MessageList[InformationType.image],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                  }, 500);
                }}
              />
            ))}
          </div>
        );

      case InformationType.image:
        return (
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageInput"
            />
            <div className="flex gap-2">
              <label
                htmlFor="imageInput"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-center cursor-pointer hover:bg-blue-600 transition-colors"
              >
                사진 선택하기
              </label>
              {petData.image ? (
                <button
                  onClick={() => {
                    informationType.current = InformationType.personality;
                    const botReply: Message = {
                      id: ++messageIdRef.current,
                      text: MessageList[InformationType.personality],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  저장하기
                </button>
              ) : (
                <button
                  onClick={() => {
                    informationType.current = InformationType.personality;
                    const botReply: Message = {
                      id: ++messageIdRef.current,
                      text: MessageList[InformationType.personality],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                    setPetData((prev) => ({ ...prev, image: "" }));
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  건너뛰기
                </button>
              )}
            </div>
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
                  setPetData((prev) => ({
                    ...prev,
                    personality: selectedPersonalities,
                  }));
                  const newUserMessage: Message = {
                    id: ++messageIdRef.current,
                    text: selectedPersonalities.join(", "),
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, newUserMessage]);
                  setTimeout(() => {
                    informationType.current = InformationType.friend;
                    const botReply: Message = {
                      id: ++messageIdRef.current,
                      text: MessageList[InformationType.friend],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                  }, 500);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                확인
              </button>
            )}
          </div>
        );

      case InformationType.friend:
        return (
          <div className="flex-1 flex items-center">
            <div className="flex-1 overflow-x-auto scrollbar-hide">
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
                  setPetData((prev) => ({ ...prev, friend: selectedFriends }));
                  const newUserMessage: Message = {
                    id: ++messageIdRef.current,
                    text: selectedFriends.join(", "),
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, newUserMessage]);
                  setTimeout(() => {
                    informationType.current = InformationType.favorite;
                    const botReply: Message = {
                      id: ++messageIdRef.current,
                      text: MessageList[InformationType.favorite],
                      sender: "bot",
                    };
                    setMessages((prev) => [...prev, botReply]);
                  }, 500);
                }}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                  id: ++messageIdRef.current,
                  text: MessageList[InformationType.name],
                  sender: "bot",
                };
                setMessages((prev) => [...prev, botReply]);
              }}
            />
            <Chip label="완료하기" selected={false} onClick={handleComplete} />
          </div>
        );

      default:
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-10 px-3 border rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-sm text-gray-800"
              placeholder={PlaceholderList[informationType.current]}
            />
            <button
              type="submit"
              className="flex-shrink-0 h-10 px-4 bg-blue-500 text-white rounded-lg text-sm whitespace-nowrap hover:bg-blue-600 transition-colors"
            >
              보내기
            </button>
          </form>
        );
    }
  };

  if (isPetLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1 text-center">
            <h1 className="font-semibold text-gray-800">🐾 티키타카</h1>
            <span className="text-xs text-gray-500">반려동물 정보 입력</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 prevent-overscroll">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex-1 text-center">
          <h1 className="font-semibold text-gray-800">🐾 티키타카</h1>
          <span className="text-xs text-gray-500">반려동물 정보 입력</span>
        </div>
      </header>

      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-6 flex flex-col text-gray-800"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: msg.delay ?? 0 }}
            className="flex items-start gap-2"
          >
            {msg.sender === "bot" && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-300 flex items-center justify-center text-white text-sm mt-1">
                <img
                  src="/images/bellong.png"
                  alt="Bellong Character"
                  className="w-8 h-8"
                />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[70%] text-sm ${
                msg.sender === "bot" ? "bg-blue-200" : "bg-gray-200 ml-auto"
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="업로드된 이미지"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white border-t">{renderInputField()}</div>
    </div>
  );
}

export default function InputField() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      }
    >
      <InputFieldContent />
    </Suspense>
  );
}
