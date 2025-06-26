import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
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
    const navigate = useNavigate()

    useEffect(() => {
        fetchTransactions(page)
    }, [page])

    async function fetchTransactions(page=1) {
        try {
            const user = await authService.getUser()
            const response = await authService.fetchData("/transactions", {"page": page, "user": user})
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

    const handlePreviousPage = () => {
        try {
            if (page > 1) {
                setPage(page - 1)
            }
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleNextPage = () => {
        try {
            setPage(page + 1)
        } catch (error) {
            console.error("Error", error)
        }
    }

    return (
        <>
            <div className="min-h-svh m-2">
                <Button className="min-w-[12rem] m-2" onClick={handleAdd}><FilePlus />Add</Button>
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
                                            <TableCell className="text-sm">{tx.date}</TableCell>
                                            <TableCell className="text-sm">{tx.name}</TableCell>
                                            <TableCell className="text-sm">{tx.amount}</TableCell>
                                            <TableCell className="text-sm">{tx.location_name}</TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex flex-wrap gap-1">{
                                                tx.groups.map((group) => 
                                                    <Badge className="truncate max-w-[120px] inline-block px-2" title={group.name} key={group.id} variant="secondary">{group.name}</Badge>
                                                )}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex flex-wrap gap-1">{
                                                tx.attachments.map((attachment) => 
                                                    <Badge className="truncate max-w-[120px] inline-block px-2" title={attachment.name} key={attachment.id} variant="secondary">{attachment.name}</Badge>
                                                )}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">{tx.payment_method}</TableCell>
                                            <TableCell className="text-sm">{tx.category}</TableCell>
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