import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
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

function GroupListPage() {
    const [groups, setGroups] = useState([])
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
        fetchGroups(filters)
    }, [filters])

    async function fetchGroups(filters) {
        try {
            const response = await authService.fetchData("/groups", filters)
            const data = processGroups(response.data)
            setGroups(data)
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function processGroups(data) {
        return data.map((tx) => ({
            id: tx.id,
            name: tx.name,
        }))
    }

    const handleEdit = async (id) => {
        try {
            navigate(`/groups/${id}`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await authService.deleteData(`/groups/${id}`)
            window.location.reload()
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleAdd = async (id) => {
        try {
            navigate(`/groups/add`)
        } catch (error) {
            console.error("Error", error)
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
                            groups.length === 0 ?
                                <div className="h-20 flex text-center items-center justify-center w-full">
                                    <h2>No Groups Available</h2>
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
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-sm">{tx.name}</TableCell>
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

export default GroupListPage