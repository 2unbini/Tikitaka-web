import { Feedback } from "@/types/feedback";
import { supabase } from "@/lib/supabase";

export const feedbackService = {
  async getFeedbackBySessionId(sessionId: string) {
    const { data, error } = await supabase
      .from("feedback")
      .select()
      .eq("session_id", sessionId)
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  },
  async createFeedback(feedback: Omit<Feedback, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("feedback")
      .insert(feedback)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
