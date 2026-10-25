import apiClient from "@/lib/apiClient"
import type { AssistantReply, AssistantHistoryEntry } from "@/api/types"

// The backend keeps no conversation state itself -- the caller resends the
// full history (oldest first, alternating user/assistant) on every call.
// Omitting history (or passing []) starts a new conversation.
export const askAssistant = (message: string, history: AssistantHistoryEntry[] = []) =>
    apiClient.post<AssistantReply>("/assistant/query", { message, history })
