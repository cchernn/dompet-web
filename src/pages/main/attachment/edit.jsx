import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { getAttachment, updateAttachment } from "@/api/attachments"

const formSchema = z.object({
    filename: z.string()
        .min(1, { message: "Filename is required" })
        .max(255, { message: "Filename must be less than 255 characters" }),
})

function formatSize(bytes) {
    if (bytes === null || bytes === undefined) return "—"
    const units = ["B", "KB", "MB", "GB"]
    let value = bytes
    let unitIndex = 0
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024
        unitIndex += 1
    }
    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function AttachmentEditPage() {
    const { attachment_id } = useParams()
    const [attachment, setAttachment] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(formSchema),
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    useEffect(() => {
        fetchAttachment()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchAttachment() {
        try {
            const { data } = await getAttachment(attachment_id)
            setAttachment(data)
            form.reset({ filename: data.filename ?? "" })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (values) => {
        const filename = values.filename?.trim()
        if (!filename || filename === attachment?.filename) {
            toast.info("Nothing to update")
            navigate("/attachments")
            return
        }
        try {
            await updateAttachment(attachment_id, { filename })
            toast.success("Attachment updated")
            navigate("/attachments")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Attachment ID: {attachment_id}</CardTitle>
                </CardHeader>
                {loading ? (
                    <div className="w-full">
                        <Skeleton className="h-6 w-full my-2" />
                        <Skeleton className="h-6 w-full my-2" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant="secondary">{attachment?.content_type || "unknown type"}</Badge>
                            <Badge variant="secondary">{formatSize(attachment?.size_bytes)}</Badge>
                            <Badge variant={attachment?.is_active ? "secondary" : "outline"}>
                                {attachment?.is_active ? "Active" : "Deleted"}
                            </Badge>
                            {attachment?.download_url && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.open(attachment.download_url, "_blank", "noreferrer")}
                                >
                                    <Download />Download
                                </Button>
                            )}
                        </div>
                        <Form {...form}>
                            <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="filename"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Filename</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Filename" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Renames the attachment&apos;s metadata only. To replace the file itself, upload a new attachment.
                                            </FormDescription>
                                            <FormMessage>{errors.filename?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col gap-2 w-full max-w-xs">
                                    <Button type="submit" disabled={isSubmitting}>Submit</Button>
                                    <Button type="button" onClick={onBack}>Back</Button>
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </Card>
        </div>
    )
}

export default AttachmentEditPage
