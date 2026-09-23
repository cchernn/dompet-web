import { useNavigate } from "react-router-dom"
import {
    Users,
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
import { listBudgets, deleteBudget } from "@/api/budgets"
import { usePaginatedList } from "@/hooks/use-paginated-list"

function BudgetListPage() {
    const navigate = useNavigate()
    const {
        items: budgets,
        loading,
        page,
        totalPages,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listBudgets({ page, pageSize }))

    const handleManage = (id) => navigate(`/budgets/${id}`)
    const handleAdd = () => navigate(`/budgets/add`)

    const handleDelete = async (id) => {
        try {
            await deleteBudget(id)
            toast.success("Budget deleted")
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
                    ) : budgets.length === 0 ? (
                        <div className="h-20 flex text-center items-center justify-center w-full">
                            <h2>No Budgets Available</h2>
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Status</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budgets.map((budget) => (
                                    <TableRow key={budget.id}>
                                        <TableCell className="text-sm">{budget.name}</TableCell>
                                        <TableCell className="text-sm">
                                            <Badge variant={budget.is_active ? "secondary" : "outline"}>
                                                {budget.is_active ? "Active" : "Deleted"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex justify-center items-center gap-1">
                                            <Button onClick={() => handleManage(budget.id)}><Users />Manage</Button>
                                            <Alert
                                                button_text={<Trash2 />}
                                                title="Confirm Delete"
                                                description="This action cannot be undone. Deleted budgets cannot be restored from this app."
                                                action={() => handleDelete(budget.id)}
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

export default BudgetListPage
