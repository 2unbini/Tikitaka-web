import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chatService } from "@/services/chatService";
import { usePet } from "@/hooks/usePet";
import { useSession } from "./useSession";

export function useChat(
  sharedSessionId?: string | null,
  sharedPetId?: string | null
) {
  const sessionId = useSession();
  const queryClient = useQueryClient();
  const { pet } = usePet();

  const effectiveSessionId = sharedSessionId || sessionId;
  const effectivePetId = sharedPetId || pet?.id;

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["chat-messages", effectiveSessionId, effectivePetId],
    queryFn: () =>
      chatService.getChatMessages(effectiveSessionId, effectivePetId),
    enabled: Boolean(effectiveSessionId && effectivePetId),
    initialData: [],
  });

  const createMessageMutation = useMutation({
    mutationFn: chatService.createChatMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", effectiveSessionId, effectivePetId],
      });
    },
  });

  return {
    messages,
    isLoading: isMessagesLoading,
    createMessage: createMessageMutation.mutate,
  };
}
