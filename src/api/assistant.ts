import apiClient from "@/lib/apiClient"
import type { AssistantReply } from "@/api/types"

// Stateless — each call is an independent question, no conversation history
// is sent or kept server-side.
export const askAssistant = (message: string) =>
    apiClient.post<AssistantReply>("/assistant/query", { message })
