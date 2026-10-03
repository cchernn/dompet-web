import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
    Download,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import Alert from "@/lib/alertDialog"
import { toast } from "@/lib/toast"
import { searchAttachments, deleteAttachment, getAttachment } from "@/api/attachments"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import type { AttachmentSearchResult } from "@/api/types"

function formatSize(bytes?: number | null): string {
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
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedAttachment, setSelectedAttachment] = useState<AttachmentSearchResult | null>(null)
    const [search, setSearch] = useState("")

    const {
        items: attachments,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => searchAttachments({ page, pageSize, q: search || undefined }))

    const handleAdd = () => navigate(`/attachments/add`)

    const openAttachment = (attachment: AttachmentSearchResult) => {
        setSelectedAttachment(attachment)
        setSheetOpen(true)
    }

    // Debounce the name search so typing doesn't fire a request per keystroke.
    const didMount = useRef(false)
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        const timeout = setTimeout(() => {
            setPage(1)
            reload()
        }, 300)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

    const clearFilters = () => {
        setSearch("")
        setPage(1)
        reload()
    }

    const handleDownload = async (attachmentId: string) => {
        // The list/panel data never carries a download_url (listing many
        // attachments shouldn't pay for an S3 presigned-URL generation per
        // row) — fetch one on demand for the specific attachment being
        // opened, same pattern as the transactions page.
        const newTab = window.open("", "_blank")
        try {
            const { data } = await getAttachment(attachmentId)
            if (newTab && data.download_url) newTab.location.href = data.download_url
        } catch (error) {
            if (newTab) newTab.close()
            toast.error((error as Error).message)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteAttachment(id)
            toast.success("Attachment deleted")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Attachments</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add attachment</Button>
            </div>

            <Card className="p-4 m-2 rounded-2xl shadow-md border">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Search</Label>
                        <Input
                            className="w-56"
                            placeholder="Search by filename"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {search && (
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            <X />Clear filters
                        </Button>
                    )}
                </div>
            </Card>

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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Attachment</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attachments.map((attachment) => (
                                    <TableRow
                                        key={attachment.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openAttachment(attachment)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openAttachment(attachment)
                                            }
                                        }}
                                    >
                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-medium truncate">{attachment.filename}</span>
                                                <span className="text-sm text-muted-foreground truncate">
                                                    {formatSize(attachment.size_bytes)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {attachment.content_type ? <Badge variant="outline">{attachment.content_type}</Badge> : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Attachment</SheetTitle>
                        <SheetDescription className="sr-only">Attachment details</SheetDescription>
                    </SheetHeader>
                    {selectedAttachment && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div className="text-xl font-semibold break-all">{selectedAttachment.filename}</div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Type</span>
                                    <span>{selectedAttachment.content_type || "—"}</span>

                                    <span className="text-muted-foreground">Size</span>
                                    <span>{formatSize(selectedAttachment.size_bytes)}</span>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="self-start"
                                    onClick={() => handleDownload(selectedAttachment.id)}
                                >
                                    <Download />Download
                                </Button>
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/attachments/${selectedAttachment.id}`)}>
                                    <FilePenLine />Edit
                                </Button>
                                <Alert
                                    button_text={<><Trash2 />Delete</>}
                                    title="Confirm Delete"
                                    description="This action cannot be undone. Deleted attachments cannot be restored from this app."
                                    action={() => handleDelete(selectedAttachment.id)}
                                />
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default AttachmentListPage
