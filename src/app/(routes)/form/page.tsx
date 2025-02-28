"use client";

import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  delay?: number;
  image?: string;
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
  image = "image",
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
  [InformationType.image]: "혹시 사진 있어? 없다면 넘어가도 좋아.",
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

const PlaceholderList = {
  [InformationType.name]: "이름 예시: 토토, 도리, 호떡이 등",
  [InformationType.age]: "나이 예시: 1살, 8개월, 6년 등",
  [InformationType.type]: "종 예시: 강아지, 고양이, 도마뱀 등",
  [InformationType.breed]: "품종 예시: 포메라니안, 블루화이트, 믹스 등",
  [InformationType.gender]: "성별 예시: 남자, 여자, 중성화, 없음",
  [InformationType.image]:
    "사진 예시: 토토의 사진, 도리의 사진, 호떡이의 사진 등",
  [InformationType.personality]:
    "성격 예시: 활발한, 소심한, 애교많은, 독립적인, 사교적인, 겁많은, 용감한, 장난꾸러기, 차분한, 예민한",
  [InformationType.friend]:
    "친구 예시: 사람, 같은 동물, 다른 동물, 혼자가 좋아",
  [InformationType.favorite]:
    "좋아하는 것 예시: 수박 껍질, 터그 놀이, 주인 빼고 다 등",
  [InformationType.dislike]: "싫어하는 것 예시: 사람 손길, 당근, 다른 동물 등",
  [InformationType.description]:
    "추가 설명 예시: 무지개별로 떠났어요, 개냥이에요, 사람을 무서워해요.",
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
  const sessionId = useSession();
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
  const messageIdRef = useRef(2);
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
    // TODO: - 바로 넘어가지 말고 데이터가 있다는걸 알리고 넘기기
    const checkExistingPet = async () => {
      if (!sessionId) return;

      const { data, error } = await supabase
        .from("pets")
        .select()
        .eq("session_id", sessionId)
        .single();

      if (error) {
        if (error.code !== "PGRST116") {
          console.error("Error fetching pet:", error);
        }
        return;
      }

      if (data) {
        router.push(`/chat?pet=${encodeURIComponent(JSON.stringify(data))}`);
      }
    };

    checkExistingPet();
  }, [sessionId, router]);

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
          id: messageIdRef.current + 2,
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

  // 폼 완료 시 데이터 저장
  const savePetInfo = async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from("pets")
      .insert({
        ...pet,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

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
        informationType.current = InformationType.image;
        console.log("currentType in case gender", informationType.current);
        break;
      case InformationType.image:
        setPet((prev) => ({ ...prev, image: input }));
        informationType.current = InformationType.personality;
        console.log("currentType in case image", informationType.current);
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
          if (pet.image) {
            const newUserImageMessage: Message = {
              id: ++messageIdRef.current,
              text: "사진이 등록됐어요!",
              sender: "user",
              image: pet.image,
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
        console.log("image input");
        return (
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  // 파일 크기 체크 (5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    alert("파일 크기는 5MB 이하여야 합니다.");
                    return;
                  }

                  // 로딩 메시지 표시
                  const loadingMessage: Message = {
                    id: ++messageIdRef.current,
                    text: "사진을 업로드하고 있어 💓",
                    sender: "bot",
                  };
                  setMessages((prev) => [...prev, loadingMessage]);

                  // 파일명을 유니크하게 생성
                  const fileExt = file.name.split(".").pop();
                  const fileName = `${Math.random()
                    .toString(36)
                    .substring(2)}_${Date.now()}.${fileExt}`;
                  const filePath = `pet_images/${fileName}`;

                  // Supabase Storage에 업로드
                  const { data, error } = await supabase.storage
                    .from("pets")
                    .upload(filePath, file, {
                      cacheControl: "3600",
                      upsert: false,
                    });

                  if (error) throw error;

                  // 공개 URL 생성
                  const {
                    data: { publicUrl },
                  } = supabase.storage.from("pets").getPublicUrl(filePath);

                  // 상태 업데이트
                  setPet((prev) => ({ ...prev, image: publicUrl }));

                  // 성공 메시지 표시
                  setMessages((prev) =>
                    prev.filter((msg) => msg.id !== loadingMessage.id)
                  );
                  const successMessage: Message = {
                    id: ++messageIdRef.current,
                    text: "사진이 잘 등록됐어!",
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, successMessage]);
                } catch (error) {
                  console.error("이미지 업로드 실패:", error);
                  const errorMessage: Message = {
                    id: ++messageIdRef.current,
                    text: "사진 업로드에 실패했어😞 다시 시도해줄래?",
                    sender: "bot",
                  };
                  setMessages((prev) => [...prev, errorMessage]);
                  setPet((prev) => ({ ...prev, image: "" }));
                }
              }}
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
              <button
                onClick={() => {
                  informationType.current = InformationType.personality;
                  const botReply: Message = {
                    id: ++messageIdRef.current,
                    text: MessageList[InformationType.personality],
                    sender: "bot",
                  };
                  setMessages((prev) => [...prev, botReply]);
                  setPet((prev) => ({ ...prev, image: "" }));
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                건너뛰기
              </button>
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
                  setPet((prev) => ({
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
                  id: ++messageIdRef.current,
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
                  id: ++messageIdRef.current,
                  text: "정보 입력 완료! 이제 대화를 시작해보자.",
                  sender: "bot",
                };
                setMessages((prev) => [...prev, completionMessage]);
                savePetInfo()
                  .then(() => {
                    router.push(
                      `/chat?pet=${encodeURIComponent(JSON.stringify(pet))}`
                    );
                  })
                  .catch((error) => {
                    console.error("Error saving pet info:", error);
                  });
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
            placeholder={PlaceholderList[informationType.current]}
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
            className={`p-3 rounded-lg ${
              msg.sender === "bot"
                ? "bg-blue-200 mr-auto"
                : "bg-green-200 ml-auto"
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
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 max-w-full">
          {renderInputField()}
          {informationType.current !== InformationType.gender &&
            informationType.current !== InformationType.personality &&
            informationType.current !== InformationType.friend &&
            informationType.current !== InformationType.checkInformation &&
            informationType.current !== InformationType.image && (
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
