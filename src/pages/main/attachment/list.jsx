import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
    File,
    X,
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
import {
    Card,
} from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { 
    Skeleton 
} from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Alert from "@/lib/alertDialog"
import authService from "@/lib/authService"

function AttachmentListPage() {
    const [attachments, setAttachments] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({"page": page})
    const navigate = useNavigate()

    useEffect(() => {
        const init = async () => {
            setFilters({ page: 1 })
        }
        init()
    }, [])

    useEffect(() => {
        fetchAttachments(filters)
    }, [filters])

    async function fetchAttachments(filters) {
        try {
            const response = await authService.fetchData("/attachments", filters)
            const data = processAttachments(response.data)
            setAttachments(data)
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function processAttachments(data) {
        return data.map((tx) => ({
            id: tx.id,
            date: new Date(tx.date).toLocaleDateString("en-CA", {timeZone: "Asia/Kuala_Lumpur"}),
            name: tx.name,
            url: tx.url,
            filename: tx.filename,
            type: tx.type,
        }))
    }

    const handleEdit = async (id) => {
        try {
            navigate(`/attachments/${id}`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await authService.deleteData(`/attachments/${id}`)
            window.location.reload()
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleAdd = async (id) => {
        try {
            navigate(`/attachments/add`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleRedirect = async(url) => {
        try {
            window.open(url, "_blank", "noopener,noreferrer")
        } catch (error) {
            console.log("Error", error)
        }
    }

    const handlePreviousPage = () => {
        try {
            if (page > 1) {
                const newPage = page - 1
                setPage(newPage)
                setFilters((prev) => ({ ...prev, page: newPage}))
            }
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleNextPage = () => {
        try {
            const newPage = page + 1
            setPage(newPage)
            setFilters((prev) => ({ ...prev, page: newPage}))
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleFilter = async (var_key, var_value) => {
        try {
            setFilters((prev) => ({ ...prev, [var_key]: var_value }))
        } catch (error) {
            console.error("Error", error)
        }
    }

    const removeFilter = async (key) => {
        try {
            setFilters((prev) => {
                const updated = { ...prev }
                delete updated[key]
                return { ...updated, page: 1 } // Reset to page 1 on filter change
            })
        } catch (error) {
            console.error("Error", error)
        }
    }

    return (
        <>
            <div className="min-h-svh m-2">
                <Button className="min-w-[12rem] m-2" onClick={handleAdd}><FilePlus />Add</Button>
                {Object.entries(filters).map( ([key, value]) => {
                    if (!value || key === "page") return null
                    return (
                        <Badge
                            key={key}
                            className="m-1 inline-flex items-center gap-2 px-2 py-1 text-sm bg-muted text-muted-foreground hover:bg-muted/80"
                        >
                            {key}: {String(value)}
                            <button
                                className="ml-1 text-muted-foreground hover:text-destructive"
                                onClick={() => removeFilter(key)}
                            >
                                <X />
                            </button>
                        </Badge>
                    )
                })}
                <Card className="p-6 rounded-2xl shadow-md border">
                    <div className="overflow-x-auto w-full">
                        {
                            loading ?
                                <div>
                                    <Skeleton className="h-6 w-full my-2" />
                                    <Skeleton className="h-6 w-full my-2" />
                                </div> 
                            :
                            attachments.length === 0 ?
                                <div className="h-20 flex text-center items-center justify-center w-full">
                                    <h2>No Attachments Available</h2>
                                </div>
                            :
                            <Table className="min-w-full">
                                <TableCaption>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    onClick={handlePreviousPage} 
                                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink 
                                                    className="font-bold text-primary cursor-default"
                                                >{page}</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext 
                                                    onClick={handleNextPage} 
                                                    className="cursor-pointer"
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Date</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">File</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-sm">{tx.date}</TableCell>
                                            <TableCell className="text-sm">{tx.name}</TableCell>
                                            <TableCell className="text-sm">{
                                                tx.url ? <Button title={tx.filename} onClick={() => handleRedirect(tx.url)}><File /><span className="truncate max-w-[120px] hidden xl:inline">{tx.filename}</span></Button> : ""
                                            }</TableCell>
                                            <TableCell className="text-sm">{tx.type}</TableCell>
                                            <TableCell className="flex justify-center items-center gap-1">
                                                <Button onClick={() => handleEdit(tx.id)}><FilePenLine /></Button>
                                                <Alert 
                                                    button_text={<Trash2 />}
                                                    title="Confirm Delete"
                                                    description="This action cannot be undone. This will permanently remove this attachment."
                                                    action={() => handleDelete(tx.id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        }
                    </div>
                </Card>
            </div>
        </>
    )
}

export default AttachmentListPage