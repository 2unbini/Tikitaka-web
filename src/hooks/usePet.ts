import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Pet } from "@/types/pet";
import { petService } from "@/services/petService";
import { useSession } from "./useSession";

export function usePet(sharedPetId?: string | null) {
  const sessionId = useSession();
  const queryClient = useQueryClient();

  const effectivePetId = sharedPetId;
  const effectiveSessionId = sessionId;

  const {
    data: pet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pet", effectiveSessionId, effectivePetId],
    queryFn: () =>
      effectivePetId
        ? petService.getPetById(effectivePetId)
        : petService.getPetBySessionId(effectiveSessionId),
    enabled: Boolean(effectivePetId || effectiveSessionId),
  });

  const createPetMutation = useMutation({
    mutationFn: petService.createPet,
    onSuccess: (newPet: Pet) => {
      queryClient.setQueryData(["pet", effectiveSessionId], newPet);
    },
  });

  return {
    pet,
    isLoading,
    error,
    createPet: createPetMutation.mutate,
    isCreating: createPetMutation.isPending,
  };
}
