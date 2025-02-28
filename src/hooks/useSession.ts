import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const getOrCreateSession = async () => {
      // localStorage에서 기존 세션 ID 확인
      let id = localStorage.getItem("session_id");

      if (!id) {
        try {
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
            console.error("세션 ID가 생성되지 않았습니다.");
          }
        } catch (error) {
          console.error("세션 생성 실패:", error);
          return;
        }
      }

      setSessionId(id);
    };

    getOrCreateSession();
  }, []);

  return sessionId;
}
