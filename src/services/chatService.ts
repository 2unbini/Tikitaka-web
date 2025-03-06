import { supabase } from "@/lib/supabase";

export const chatService = {
  async getChatMessages(sessionId: string | null, petId: string | null) {
    if (!sessionId || !petId) return [];

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .eq("pet_id", petId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (
      data?.map((msg, index) => ({
        id: index + 1,
        text: msg.content,
        sender: msg.sender as "user" | "bot",
      })) || []
    );
  },

  async createChatMessage(message: {
    session_id: string;
    pet_id: string;
    content: string;
    sender: "user" | "bot";
  }) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
