import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getOrCreateSession = async () => {
      // localStorage에서 기존 세션 ID 확인
      let id = localStorage.getItem("session_id");

      if (!id) {
        try {
          // 세션 생성 전에 다시 한번 확인
          id = localStorage.getItem("session_id");
          if (id) {
            setSessionId(id);
            return;
          }

          // 임시 ID를 먼저 저장하여 동시 생성 방지
          const tempId = `temp_${Date.now()}`;
          localStorage.setItem("session_id", tempId);

          // 새 세션 생성
          const { data, error } = await supabase
            .from("sessions")
            .insert({})
            .select()
            .single();

          if (error) throw error;

          id = data.id;

          if (id) {
            localStorage.setItem("session_id", id);
          } else {
            throw new Error("세션 ID가 생성되지 않았습니다.");
          }
        } catch {
          localStorage.removeItem("session_id");
          alert("세션 생성에 실패했어요. 다시 시도해주세요.");
          router.push("/");
          return;
        }
      }

      setSessionId(id);
    };

    getOrCreateSession();
  }, []);

  return sessionId;
}
