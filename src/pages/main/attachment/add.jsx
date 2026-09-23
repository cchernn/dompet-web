import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { createAndUploadAttachment } from "@/api/attachments"

function AttachmentAddPage() {
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [fileError, setFileError] = useState("")
    const [uploading, setUploading] = useState(false)

    const onBack = () => navigate(-1)

    const onSubmit = async (event) => {
        event.preventDefault()
        if (!file) {
            setFileError("Please choose a file to upload")
            return
        }
        setFileError("")
        setUploading(true)
        try {
            await createAndUploadAttachment(file)
            toast.success("Attachment uploaded")
            navigate("/attachments")
        } catch (error) {
            toast.error(error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>New Attachment</CardTitle>
                </CardHeader>
                <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={onSubmit}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="attachment-file">File</Label>
                        <Input
                            id="attachment-file"
                            type="file"
                            onChange={(event) => {
                                setFile(event.target.files?.[0] ?? null)
                                setFileError("")
                            }}
                        />
                        {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-xs">
                        <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Submit"}</Button>
                        <Button type="button" onClick={onBack} disabled={uploading}>Back</Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default AttachmentAddPage
