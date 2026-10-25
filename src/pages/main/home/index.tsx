import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Send, Loader2, Sparkles, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { askAssistant } from "@/api/assistant"
import type { AssistantHistoryEntry } from "@/api/types"

interface ChatMessage {
    id: string
    role: "user" | "assistant"
    text: string
}

// Mirrors the backend's own cap (MAX_MESSAGE_LENGTH in
// app/handlers/assistant.py) so a too-long question is rejected locally
// instead of after a round trip.
const MAX_MESSAGE_LENGTH = 1000

// Survives navigating away and back within the tab -- the backend itself
// keeps no state (see askAssistant), this is purely a client-side record.
const STORAGE_KEY = "dompet:overview-chat"

const EXAMPLE_PROMPTS = [
    "How much did I spend last month?",
    "What are my biggest purchases this month?",
    "How much do I have left in each budget?",
    "What's my spending trend this year?",
]

interface StoredChat {
    messages: ChatMessage[]
    // Confirmed turns only -- a failed send leaves its user message in
    // `messages` (so it stays visible) but never lands here, per the
    // backend's contract: append nothing to history on error.
    history: AssistantHistoryEntry[]
}

function loadChat(): StoredChat {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return { messages: [], history: [] }
        const parsed = JSON.parse(raw)
        return { messages: parsed.messages ?? [], history: parsed.history ?? [] }
    } catch {
        return { messages: [], history: [] }
    }
}

function saveChat(chat: StoredChat) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chat))
    } catch {
        // Ignore -- e.g. private browsing with storage blocked. The
        // conversation just won't survive navigation this session.
    }
}

function HomePage() {
    const [messages, setMessages] = useState<ChatMessage[]>(() => loadChat().messages)
    const [history, setHistory] = useState<AssistantHistoryEntry[]>(() => loadChat().history)
    const [question, setQuestion] = useState("")
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        saveChat({ messages, history })
    }, [messages, history])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, [messages, sending])

    // Mobile keyboards push the viewport up, which can leave the newest
    // message hidden behind it even though the scroll container itself
    // hasn't changed size yet -- nudge again once the keyboard has
    // finished animating in.
    const handleFocus = () => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300)
    }

    const resizeTextarea = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }

    const sendQuestion = async (override?: string) => {
        const text = (override ?? question).trim()
        if (!text || sending || text.length > MAX_MESSAGE_LENGTH) return

        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }])
        setQuestion("")
        requestAnimationFrame(resizeTextarea)
        setSending(true)
        try {
            const { data } = await askAssistant(text, history)
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: data.reply }])
            setHistory((prev) => [...prev, { role: "user", text }, { role: "assistant", text: data.reply }])
        } catch (error) {
            // Append nothing to history on error, per the backend's
            // contract -- the failed message stays visible in `messages`
            // only, so retrying doesn't resend it as a confirmed turn.
            toast.error((error as Error).message)
        } finally {
            setSending(false)
        }
    }

    const clearChat = () => {
        setMessages([])
        setHistory([])
    }

    const overLimit = question.length > MAX_MESSAGE_LENGTH

    return (
        <div className="flex flex-col gap-4 h-[calc(100dvh-4rem)] sm:h-auto sm:m-2 sm:max-w-2xl">
            <h1 className="hidden sm:block text-2xl font-semibold tracking-tight">Overview</h1>

            <Card className="flex flex-col flex-1 min-h-0 rounded-none border-x-0 sm:flex-none sm:h-[60vh] sm:rounded-2xl sm:border-x">
                <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Ask Dompet</span>
                    </div>
                    {messages.length > 0 && (
                        <Button type="button" variant="ghost" size="sm" onClick={clearChat}>
                            <Trash2 className="size-3.5" />Clear
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                    {messages.length === 0 && (
                        <div className="m-auto flex flex-col items-center gap-3 text-center">
                            <p className="text-sm text-muted-foreground">
                                Ask about your transactions or budgets.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {EXAMPLE_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => sendQuestion(prompt)}
                                        disabled={sending}
                                        className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                message.role === "user"
                                    ? "self-end bg-primary text-primary-foreground whitespace-pre-wrap"
                                    : "self-start bg-muted"
                            )}
                        >
                            {message.role === "assistant" ? (
                                <ReactMarkdown
                                    components={{
                                        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({ ...props }) => <ul className="mb-2 list-disc pl-4 last:mb-0" {...props} />,
                                        ol: ({ ...props }) => <ol className="mb-2 list-decimal pl-4 last:mb-0" {...props} />,
                                        li: ({ ...props }) => <li className="mb-0.5" {...props} />,
                                        strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
                                        code: ({ ...props }) => <code className="rounded bg-background/60 px-1 py-0.5 text-xs" {...props} />,
                                        a: ({ ...props }) => <a className="underline" target="_blank" rel="noreferrer" {...props} />,
                                    }}
                                >
                                    {message.text}
                                </ReactMarkdown>
                            ) : (
                                message.text
                            )}
                        </div>
                    ))}
                    {sending && (
                        <div className="self-start flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin" />
                            Thinking...
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="flex flex-col gap-1 border-t px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                    <div className="flex items-end gap-2">
                        <Textarea
                            ref={textareaRef}
                            placeholder="Ask a question..."
                            value={question}
                            disabled={sending}
                            rows={1}
                            className="resize-none max-h-[200px]"
                            onFocus={handleFocus}
                            onChange={(e) => {
                                setQuestion(e.target.value)
                                resizeTextarea()
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    sendQuestion()
                                }
                            }}
                        />
                        <Button size="icon" disabled={sending || !question.trim() || overLimit} onClick={() => sendQuestion()}>
                            <Send className="size-4" />
                        </Button>
                    </div>
                    <span className={cn("self-end text-xs", overLimit ? "text-destructive" : "text-muted-foreground")}>
                        {question.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                </div>
            </Card>
        </div>
    )
}

export default HomePage
