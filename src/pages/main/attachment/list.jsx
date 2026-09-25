import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
    Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableCaption,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Alert from "@/lib/alertDialog"
import { toast } from "sonner"
import { listAttachments, deleteAttachment, getAttachment } from "@/api/attachments"
import { usePaginatedList } from "@/hooks/use-paginated-list"

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

function AttachmentListPage() {
    const navigate = useNavigate()
    const {
        items: attachments,
        loading,
        page,
        totalPages,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listAttachments({ page, pageSize }))

    const handleEdit = (id) => navigate(`/attachments/${id}`)
    const handleAdd = () => navigate(`/attachments/add`)

    const handleOpenAttachment = async (attachmentId) => {
        // The list response no longer carries a download_url (listing many
        // attachments shouldn't pay for an S3 presigned-URL generation per
        // row) — fetch one on demand for the specific attachment being
        // opened, same pattern as the transactions page.
        const newTab = window.open("", "_blank")
        try {
            const { data } = await getAttachment(attachmentId)
            if (newTab) newTab.location.href = data.download_url
        } catch (error) {
            if (newTab) newTab.close()
            toast.error(error.message)
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteAttachment(id)
            toast.success("Attachment deleted")
            reload()
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <Button className="min-w-[12rem] m-2" onClick={handleAdd}><FilePlus />Add</Button>
            <Card className="p-6 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <div>
                            <Skeleton className="h-6 w-full my-2" />
                            <Skeleton className="h-6 w-full my-2" />
                        </div>
                    ) : attachments.length === 0 ? (
                        <div className="h-20 flex text-center items-center justify-center w-full">
                            <h2>No Attachments Available</h2>
                        </div>
                    ) : (
                        <Table className="min-w-full">
                            <TableCaption>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={previousPage}
                                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink className="font-bold text-primary cursor-default">
                                                {page} / {totalPages}
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={nextPage}
                                                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Filename</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Size</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Status</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attachments.map((attachment) => (
                                    <TableRow key={attachment.id}>
                                        <TableCell className="text-sm">{attachment.filename}</TableCell>
                                        <TableCell className="text-sm">{formatSize(attachment.size_bytes)}</TableCell>
                                        <TableCell className="text-sm">{attachment.content_type || "—"}</TableCell>
                                        <TableCell className="text-sm">
                                            <Badge variant={attachment.is_active ? "secondary" : "outline"}>
                                                {attachment.is_active ? "Active" : "Deleted"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex justify-center items-center gap-1">
                                            <Button variant="outline" onClick={() => handleOpenAttachment(attachment.id)}>
                                                <Download />
                                            </Button>
                                            <Button onClick={() => handleEdit(attachment.id)}><FilePenLine /></Button>
                                            <Alert
                                                button_text={<Trash2 />}
                                                title="Confirm Delete"
                                                description="This action cannot be undone. Deleted attachments cannot be restored from this app."
                                                action={() => handleDelete(attachment.id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default AttachmentListPage
