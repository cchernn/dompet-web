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

function TransactionListPage() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({"page": page})
    const navigate = useNavigate()

    useEffect(() => {
        const init = async () => {
            const user = await authService.getUser()
            setFilters({ page: 1, user })
        }
        init()
    }, [])

    useEffect(() => {
        if (!filters.user) return 
        fetchTransactions(filters)
    }, [filters])

    async function fetchTransactions(filters) {
        try {
            const response = await authService.fetchData("/transactions", filters)
            const data = processTransactions(response.data)
            setTransactions(data)
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function processTransactions(data) {
        return data.map((tx) => ({
            id: tx.id,
            date: new Date(tx.date).toLocaleDateString("en-CA", {timeZone: "Asia/Kuala_Lumpur"}), 
            name: tx.name,
            amount: tx.amount.toFixed(2),
            payment_method: tx.payment_method,
            category: tx.category,
            location: tx.location,
            location_name: tx.location_name,
            groups: tx.groups,
            attachments: tx.attachments,
        }))
    }

    const handleEdit = async (id) => {
        try {
            navigate(`/transactions/${id}`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await authService.deleteData(`/transactions/${id}`)
            window.location.reload()
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleAdd = async (id) => {
        try {
            navigate(`/transactions/add`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handlePreviousPage = async () => {
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

    const handleNextPage = async () => {
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
                    if (!value || key === "page" || key === "user") return null
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
                            transactions.length === 0 ?
                                <div className="h-20 flex text-center items-center justify-center w-full">
                                    <h2>No Transactions Available</h2>
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
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Amount</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Location</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Groups</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Attachments</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Payment Method</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Category</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-sm">
                                                { tx.date && <Badge onClick={() => handleFilter("date", tx.date)} className="inline-block px-2 hover:bg-primary hover:text-primary-foreground" title={tx.date} variant="secondary">{tx.date}</Badge> }
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                { tx.name && <Badge onClick={() => handleFilter("name", tx.name)} className="inline-block px-2 hover:bg-primary hover:text-primary-foreground" title={tx.name} variant="secondary">{tx.name}</Badge> }
                                            </TableCell>
                                            <TableCell className="text-sm">{tx.amount}</TableCell>
                                            <TableCell className="text-sm">
                                                { tx.location && <Badge onClick={() => handleFilter("location", tx.location)} className="truncate max-w-[120px] inline-block px-2 hover:bg-primary hover:text-primary-foreground" title={tx.location_name} variant="secondary">{tx.location_name}</Badge> }
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex flex-wrap gap-1">{
                                                tx.groups.map((group) => 
                                                    <Badge onClick={() => handleFilter("group", group.id)} className="truncate max-w-[120px] inline-block px-2 hover:bg-primary hover:text-primary-foreground" title={group.name} key={group.id} variant="secondary">{group.name}</Badge>
                                                )}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex flex-wrap gap-1">{
                                                tx.attachments.map((attachment) => 
                                                    <Badge className="truncate max-w-[120px] inline-block px-2 hover:bg-primary hover:text-primary-foreground" title={attachment.name} key={attachment.id} variant="secondary">{attachment.name}</Badge>
                                                )}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                { tx.payment_method && <Badge onClick={() => handleFilter("payment_method", tx.payment_method)} className="inline-block px-2 hover:bg-primary hover:text-primary-foreground" title={tx.payment_method} variant="secondary">{tx.payment_method}</Badge> }
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                { tx.category && <Badge onClick={() => handleFilter("category", tx.category)} className="inline-block px-2 hover:bg-primary hover:text-primary-foreground" title={tx.category} variant="secondary">{tx.category}</Badge> }
                                            </TableCell>
                                            <TableCell className="flex justify-center items-center gap-1">
                                                <Button onClick={() => handleEdit(tx.id)}><FilePenLine /></Button>
                                                <Alert 
                                                    button_text={<Trash2 />}
                                                    title="Confirm Delete"
                                                    description="This action cannot be undone. This will permanently remove this transaction."
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

export default TransactionListPage