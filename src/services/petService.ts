import { Pet } from "@/types/pet";
import { supabase } from "@/lib/supabase";

export const petService = {
  async getPetBySessionId(sessionId: string | null) {
    if (!sessionId) return null;

    const { data, error } = await supabase
      .from("pets")
      .select()
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  },

  async getPetById(petId: string) {
    if (!petId) return null;

    const { data, error } = await supabase
      .from("pets")
      .select()
      .eq("id", petId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  },

  async createPet(pet: Omit<Pet, "id">) {
    const { data, error } = await supabase
      .from("pets")
      .insert(pet)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
