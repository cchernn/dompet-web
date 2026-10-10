import { useRef, useState } from "react"
import { Send, Loader2, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { askAssistant } from "@/api/assistant"

interface ChatMessage {
    id: number
    role: "user" | "assistant"
    text: string
}

function HomePage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [question, setQuestion] = useState("")
    const [sending, setSending] = useState(false)
    const nextId = useRef(0)

    const sendQuestion = async () => {
        const text = question.trim()
        if (!text || sending) return

        setMessages((prev) => [...prev, { id: nextId.current++, role: "user", text }])
        setQuestion("")
        setSending(true)
        try {
            const { data } = await askAssistant(text)
            setMessages((prev) => [...prev, { id: nextId.current++, role: "assistant", text: data.reply }])
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col gap-4 m-2 max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>

            <Card className="flex flex-col h-[60vh]">
                <div className="flex items-center gap-2 border-b px-4 py-3">
                    <Sparkles className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ask Dompet</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                    {messages.length === 0 && (
                        <p className="text-sm text-muted-foreground m-auto text-center">
                            Ask about your transactions or budgets — e.g. &quot;how much did I spend last month?&quot;
                        </p>
                    )}
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                                message.role === "user"
                                    ? "self-end bg-primary text-primary-foreground"
                                    : "self-start bg-muted"
                            )}
                        >
                            {message.text}
                        </div>
                    ))}
                    {sending && (
                        <div className="self-start flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin" />
                            Thinking...
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 border-t px-4 py-3">
                    <Input
                        placeholder="Ask a question..."
                        value={question}
                        disabled={sending}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendQuestion()
                        }}
                    />
                    <Button size="icon" disabled={sending || !question.trim()} onClick={sendQuestion}>
                        <Send className="size-4" />
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default HomePage
