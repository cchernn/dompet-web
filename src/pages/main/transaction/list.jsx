import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePenLine, FilePlus, Ban, RotateCcw } from "lucide-react"
import { toast } from "sonner"
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
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { listTransactions, deactivateTransaction, reactivateTransaction } from "@/api/transactions"
import { listAccounts } from "@/api/accounts"
import { listCategories } from "@/api/categories"

function TransactionListPage() {
    const navigate = useNavigate()
    const [accountsById, setAccountsById] = useState({})
    const [categoriesById, setCategoriesById] = useState({})

    const {
        items: transactions,
        page,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listTransactions({ page, pageSize, includeInactive: true }))

    useEffect(() => {
        listAccounts({ pageSize: 100, includeInactive: true })
            .then(({ data }) => setAccountsById(Object.fromEntries(data.map((a) => [a.id, a]))))
            .catch((error) => toast.error(error.message))
        listCategories({ pageSize: 100, includeInactive: true })
            .then(({ data }) => setCategoriesById(Object.fromEntries(data.map((c) => [c.id, c]))))
            .catch((error) => toast.error(error.message))
    }, [])

    const handleAdd = () => navigate("/transactions/add")
    const handleEdit = (id) => navigate(`/transactions/${id}`)

    const handleToggleActive = async (transaction) => {
        try {
            if (transaction.is_active) {
                await deactivateTransaction(transaction.id)
                toast.success("Transaction deactivated")
            } else {
                await reactivateTransaction(transaction.id)
                toast.success("Transaction reactivated")
            }
            reload()
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-center gap-2 m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add</Button>
                {totalCount > 0 && (
                    <span className="text-sm text-muted-foreground">{totalCount} transactions</span>
                )}
            </div>
            <Card className="p-6 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <div>
                            <Skeleton className="h-6 w-full my-2" />
                            <Skeleton className="h-6 w-full my-2" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="h-20 flex text-center items-center justify-center w-full">
                            <h2>No Transactions Available</h2>
                        </div>
                    ) : (
                        <Table className="min-w-full">
                            <TableCaption>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={previousPage}
                                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Date</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Amount</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Category</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Source</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Destination</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Status</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-sm">{tx.date}</TableCell>
                                        <TableCell className="text-sm">{tx.name}</TableCell>
                                        <TableCell className="text-sm">
                                            <Badge variant="secondary">{tx.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{tx.amount} {tx.currency_code}</TableCell>
                                        <TableCell className="text-sm">
                                            {tx.category_id && (categoriesById[tx.category_id]?.name ?? "—")}
                                        </TableCell>
                                        <TableCell className="text-sm truncate max-w-[140px]" title={accountsById[tx.source_account_id]?.name}>
                                            {accountsById[tx.source_account_id]?.name ?? "—"}
                                        </TableCell>
                                        <TableCell className="text-sm truncate max-w-[140px]" title={accountsById[tx.destination_account_id]?.name}>
                                            {accountsById[tx.destination_account_id]?.name ?? "—"}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <Badge variant={tx.is_active ? "secondary" : "outline"}>
                                                {tx.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex justify-center items-center gap-1">
                                            <Button onClick={() => handleEdit(tx.id)}><FilePenLine /></Button>
                                            <Alert
                                                button_text={tx.is_active ? <Ban /> : <RotateCcw />}
                                                title={tx.is_active ? "Deactivate Transaction" : "Reactivate Transaction"}
                                                description={
                                                    tx.is_active
                                                        ? "This will mark the transaction inactive. It can be reactivated later."
                                                        : "This will restore the transaction to active status."
                                                }
                                                action={() => handleToggleActive(tx)}
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

export default TransactionListPage
