import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Users,
    Trash2,
    FilePlus,
    X,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { searchBudgets, deleteBudget } from "@/api/budgets"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import type { BudgetSearchResult } from "@/api/types"

function BudgetListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState<BudgetSearchResult | null>(null)
    const [search, setSearch] = useState("")

    const {
        items: budgets,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => searchBudgets({ page, pageSize, q: search || undefined }))

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

    const handleAdd = () => navigate(`/budgets/add`)

    const openBudget = (budget: BudgetSearchResult) => {
        setSelectedBudget(budget)
        setSheetOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteBudget(id)
            toast.success("Budget deleted")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add budget</Button>
            </div>

            <Card className="p-4 m-2 rounded-2xl shadow-md border">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Search</Label>
                        <Input
                            className="w-56"
                            placeholder="Search by name"
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Budget</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budgets.map((budget) => (
                                    <TableRow
                                        key={budget.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openBudget(budget)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openBudget(budget)
                                            }
                                        }}
                                    >
                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-medium truncate">{budget.name}</span>
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <FileText className="size-3" />{budget.transaction_count}
                                                </span>
                                            </div>
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
                        <SheetTitle>Budget</SheetTitle>
                        <SheetDescription className="sr-only">Budget details</SheetDescription>
                    </SheetHeader>
                    {selectedBudget && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div className="text-xl font-semibold">{selectedBudget.name}</div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Transactions</span>
                                    <span className="inline-flex items-center gap-1">
                                        <FileText className="size-3" />{selectedBudget.transaction_count.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/budgets/${selectedBudget.id}`)}>
                                    <Users />Manage
                                </Button>
                                <Alert
                                    button_text={<><Trash2 />Delete</>}
                                    title="Confirm Delete"
                                    description="This action cannot be undone. Deleted budgets cannot be restored from this app."
                                    action={() => handleDelete(selectedBudget.id)}
                                />
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default BudgetListPage
