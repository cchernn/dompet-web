import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { DateRange } from "react-day-picker"
import {
    FilePenLine, FilePlus, Ban, X, ArrowUp, ArrowDown, ArrowUpDown, Paperclip,
    Tag as TagIcon, ArrowRight, SlidersHorizontal, CalendarIcon,
} from "lucide-react"
import { toast } from "sonner"
import { format, parse } from "date-fns"
import { Button } from "@/components/ui/button"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import Alert from "@/lib/alertDialog"
import { cn } from "@/lib/utils"
import { AmountDisplay } from "@/components/amount-display"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { searchTransactions, deactivateTransaction } from "@/api/transactions"
import { listCategories } from "@/api/categories"
import { listAccounts } from "@/api/accounts"
import { listTags } from "@/api/tags"
import { listBudgets } from "@/api/budgets"
import { getAttachment } from "@/api/attachments"
import type { Category, Account, Tag, Budget, TransactionSearchResult, TransactionType } from "@/api/types"

const ALL = "__all__"

interface Filters {
    from: string
    to: string
    category: string
    type: TransactionType | ""
    source: string
    destination: string
    tags: string
    budgets: string
}

// A stored "YYYY-MM-DD" string must never go through `new Date(str)` — that
// parses as UTC midnight and can render as the wrong local day. Build the
// Date from its literal year/month/day components instead.
const parseFilterDate = (value?: string) => (value ? parse(value, "yyyy-MM-dd", new Date()) : undefined)

function formatDateRangeLabel(from?: string, to?: string) {
    const fromDate = parseFilterDate(from)
    const toDate = parseFilterDate(to)
    if (!fromDate && !toDate) return "All dates"
    if (fromDate && toDate) {
        return fromDate.getFullYear() === toDate.getFullYear()
            ? `${format(fromDate, "d MMM")} – ${format(toDate, "d MMM yyyy")}`
            : `${format(fromDate, "d MMM yyyy")} – ${format(toDate, "d MMM yyyy")}`
    }
    if (fromDate) return `From ${format(fromDate, "d MMM yyyy")}`
    return `Until ${format(toDate!, "d MMM yyyy")}`
}

type SortColumn = "date" | "amount"
interface SortState {
    column: SortColumn | null
    direction: "asc" | "desc"
}

interface SortableHeaderProps {
    column: SortColumn
    label: string
    sort: SortState
    onToggle: (column: SortColumn) => void
    className?: string
}

// Sorts only the rows already on the current page — the backend has no sort
// parameter (transaction_search hardcodes ORDER BY date DESC), so this can't
// reorder the full filtered result set across pages, only what's visible.
function SortableHeader({ column, label, sort, onToggle, className }: SortableHeaderProps) {
    const active = sort.column === column
    return (
        <TableHead
            className={cn("font-semibold text-sm text-muted-foreground cursor-pointer select-none", className)}
            onClick={() => onToggle(column)}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {active ? (
                    sort.direction === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                ) : (
                    <ArrowUpDown className="size-3 opacity-30" />
                )}
            </span>
        </TableHead>
    )
}

function TransactionListPage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<Category[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [filters, setFilters] = useState<Filters>({
        from: "", to: "", category: "", type: "", source: "", destination: "", tags: "", budgets: "",
    })
    const [dateRangeOpen, setDateRangeOpen] = useState(false)
    const [extraFiltersOpen, setExtraFiltersOpen] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionSearchResult | null>(null)

    const {
        items: transactions,
        page,
        setPage,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) =>
        searchTransactions({
            page,
            pageSize,
            from: filters.from || undefined,
            to: filters.to || undefined,
            category: filters.category || undefined,
            type: filters.type || undefined,
            source: filters.source || undefined,
            destination: filters.destination || undefined,
            tags: filters.tags || undefined,
            budgets: filters.budgets || undefined,
        })
    )

    useEffect(() => {
        listCategories({ pageSize: 100 })
            .then(({ data }) => setCategories(data))
            .catch((error: Error) => toast.error(error.message))
        listAccounts({ pageSize: 100 })
            .then(({ data }) => setAccounts(data))
            .catch((error: Error) => toast.error(error.message))
        listTags({ pageSize: 100 })
            .then(({ data }) => setTags(data))
            .catch((error: Error) => toast.error(error.message))
        listBudgets({ pageSize: 100 })
            .then(({ data }) => setBudgets(data))
            .catch((error: Error) => toast.error(error.message))
    }, [])

    const updateFilter = (key: keyof Filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
        reload()
    }

    const clearFilters = () => {
        setFilters({ from: "", to: "", category: "", type: "", source: "", destination: "", tags: "", budgets: "" })
        setPage(1)
        reload()
    }

    // react-day-picker's range onSelect fires once with {from, to: undefined}
    // after the first click, then {from, to} after the second — don't reload
    // on the half-picked state (wasted request, flashes the table).
    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setFilters((prev) => ({
            ...prev,
            from: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            to: range?.to ? format(range.to, "yyyy-MM-dd") : "",
        }))
        if (!range?.from || range?.to) {
            setPage(1)
            reload()
        }
        if (range?.from && range?.to) setDateRangeOpen(false)
    }

    const clearDateRange = () => {
        setFilters((prev) => ({ ...prev, from: "", to: "" }))
        setPage(1)
        reload()
        setDateRangeOpen(false)
    }

    const hasFilters = filters.from || filters.to || filters.category || filters.type
        || filters.source || filters.destination || filters.tags || filters.budgets

    interface Chip {
        key: string
        label: string
        value: string
        onRemove: () => void
    }

    const chips: Chip[] = (
        [
            filters.source && { key: "source", label: "Source", value: filters.source, onRemove: () => updateFilter("source", "") },
            filters.destination && { key: "destination", label: "Destination", value: filters.destination, onRemove: () => updateFilter("destination", "") },
            filters.tags && { key: "tags", label: "Tags", value: filters.tags, onRemove: () => updateFilter("tags", "") },
            filters.budgets && { key: "budgets", label: "Budget", value: filters.budgets, onRemove: () => updateFilter("budgets", "") },
        ] as (Chip | "" | false)[]
    ).filter((chip): chip is Chip => Boolean(chip))

    const accountOptions: ComboboxOption[] = [{ value: ALL, label: "Any" }, ...accounts.map((a) => ({ value: a.name, label: a.name }))]
    const tagOptions: ComboboxOption[] = [{ value: ALL, label: "Any" }, ...tags.map((t) => ({ value: t.name, label: t.name }))]
    const budgetOptions: ComboboxOption[] = [{ value: ALL, label: "Any" }, ...budgets.map((b) => ({ value: b.name, label: b.name }))]

    const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" })

    const toggleSort = (column: SortColumn) => {
        setSort((prev) => {
            if (prev.column !== column) return { column, direction: "asc" }
            if (prev.direction === "asc") return { column, direction: "desc" }
            return { column: null, direction: "asc" }
        })
    }

    const sortedTransactions = useMemo(() => {
        if (!sort.column) return transactions
        const column = sort.column
        const dir = sort.direction === "asc" ? 1 : -1
        return [...transactions].sort((a, b) => {
            let av: string | number = a[column]
            let bv: string | number = b[column]
            if (column === "amount") {
                av = Number(av)
                bv = Number(bv)
            } else {
                av = (av ?? "").toString().toLowerCase()
                bv = (bv ?? "").toString().toLowerCase()
            }
            if (av < bv) return -1 * dir
            if (av > bv) return 1 * dir
            return 0
        })
    }, [transactions, sort])

    const handleAdd = () => navigate("/transactions/add")

    const openTransaction = (tx: TransactionSearchResult) => {
        setSelectedTransaction(tx)
        setSheetOpen(true)
    }

    const handleOpenAttachment = async (attachmentId: string) => {
        // Open a blank tab synchronously (within the click handler) so the
        // browser's popup blocker sees it as user-initiated, then redirect
        // it once we have a fresh presigned download_url — the search
        // results only carry the attachment id, not a URL, by design (see
        // src/api/attachments.ts).
        const newTab = window.open("", "_blank")
        try {
            const { data } = await getAttachment(attachmentId)
            if (newTab && data.download_url) newTab.location.href = data.download_url
        } catch (error) {
            if (newTab) newTab.close()
            toast.error((error as Error).message)
        }
    }

    const handleDeactivate = async (transaction: TransactionSearchResult) => {
        try {
            await deactivateTransaction(transaction.id)
            toast.success("Transaction deactivated")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add transaction</Button>
            </div>

            <Card className="p-4 m-2 rounded-2xl shadow-md border">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Date</Label>
                        <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" className="w-64 justify-start font-normal">
                                    <CalendarIcon className="size-4" />
                                    {formatDateRangeLabel(filters.from, filters.to)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-auto p-0">
                                <Calendar
                                    mode="range"
                                    selected={{ from: parseFilterDate(filters.from), to: parseFilterDate(filters.to) }}
                                    onSelect={handleDateRangeSelect}
                                    defaultMonth={parseFilterDate(filters.from) ?? new Date()}
                                    initialFocus
                                />
                                <div className="p-2 border-t flex justify-end">
                                    <Button type="button" variant="ghost" size="sm" onClick={clearDateRange}>Clear</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Category</Label>
                        <Select
                            value={filters.category || ALL}
                            onValueChange={(value) => updateFilter("category", value === ALL ? "" : value)}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All categories</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Type</Label>
                        <Select
                            value={filters.type || ALL}
                            onValueChange={(value) => updateFilter("type", value === ALL ? "" : value)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All types</SelectItem>
                                <SelectItem value="expenditure">Expenditure</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Popover open={extraFiltersOpen} onOpenChange={setExtraFiltersOpen}>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                                <SlidersHorizontal />Filters
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label>Source</Label>
                                    <Combobox
                                        options={accountOptions}
                                        value={filters.source || ALL}
                                        onChange={(value) => updateFilter("source", value === ALL ? "" : value)}
                                        placeholder="Any source"
                                        searchPlaceholder="Search accounts"
                                        emptyText="No account found"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>Destination</Label>
                                    <Combobox
                                        options={accountOptions}
                                        value={filters.destination || ALL}
                                        onChange={(value) => updateFilter("destination", value === ALL ? "" : value)}
                                        placeholder="Any destination"
                                        searchPlaceholder="Search accounts"
                                        emptyText="No account found"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>Tags</Label>
                                    <Combobox
                                        options={tagOptions}
                                        value={filters.tags || ALL}
                                        onChange={(value) => updateFilter("tags", value === ALL ? "" : value)}
                                        placeholder="Any tags"
                                        searchPlaceholder="Search tags"
                                        emptyText="No tag found"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>Budget</Label>
                                    <Combobox
                                        options={budgetOptions}
                                        value={filters.budgets || ALL}
                                        onChange={(value) => updateFilter("budgets", value === ALL ? "" : value)}
                                        placeholder="Any budget"
                                        searchPlaceholder="Search budgets"
                                        emptyText="No budget found"
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {hasFilters && (
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            <X />Clear filters
                        </Button>
                    )}
                </div>

                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {chips.map((chip) => (
                            <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
                                <span className="text-muted-foreground">{chip.label}:</span> {chip.value}
                                <button type="button" onClick={chip.onRemove} className="ml-1 hover:text-destructive">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </Card>

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
                                    <SortableHeader column="date" label="Date" sort={sort} onToggle={toggleSort} />
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Transaction</TableHead>
                                    <SortableHeader column="amount" label="Amount" sort={sort} onToggle={toggleSort} className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTransactions.map((tx) => (
                                    <TableRow
                                        key={tx.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openTransaction(tx)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openTransaction(tx)
                                            }
                                        }}
                                    >
                                        <TableCell className="text-sm align-top whitespace-nowrap">{tx.date}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5 py-1 min-w-0">
                                                <span className="font-medium truncate">{tx.name}</span>
                                                <span className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                                    {tx.source}
                                                    <ArrowRight className="size-3 shrink-0" />
                                                    {tx.destination}
                                                </span>
                                                {(tx.category || tx.tags.length > 0 || tx.attachments.length > 0) && (
                                                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                        <span className="truncate">{tx.category ?? "—"}</span>
                                                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                            {tx.tags.length > 0 && (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                                                                            <TagIcon className="size-3" />{tx.tags.length}
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent align="end" className="w-56 p-2">
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {tx.tags.map((tag) => (
                                                                                <Badge key={tag} variant="outline">{tag}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                            {tx.attachments.length > 0 && (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                                                                            <Paperclip className="size-3" />{tx.attachments.length}
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent align="end" className="w-56 p-2">
                                                                        <div className="flex flex-col gap-1">
                                                                            {tx.attachments.map((a) => (
                                                                                <button
                                                                                    key={a.id}
                                                                                    type="button"
                                                                                    onClick={() => handleOpenAttachment(a.id)}
                                                                                    className="text-left text-sm truncate hover:underline"
                                                                                >
                                                                                    {a.filename}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right align-top">
                                            <AmountDisplay transaction={tx} />
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
                        <SheetTitle>Transaction</SheetTitle>
                        <SheetDescription className="sr-only">Transaction details</SheetDescription>
                    </SheetHeader>
                    {selectedTransaction && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div>
                                    <div className="text-xl font-semibold">{selectedTransaction.name}</div>
                                    <AmountDisplay transaction={selectedTransaction} className="text-lg mt-1" />
                                </div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Date</span>
                                    <span>{format(parseFilterDate(selectedTransaction.date)!, "d MMM yyyy")}</span>

                                    <span className="text-muted-foreground">Category</span>
                                    <span>{selectedTransaction.category ?? "—"}</span>

                                    <span className="text-muted-foreground">Source</span>
                                    <span>{selectedTransaction.source}</span>

                                    <span className="text-muted-foreground">Destination</span>
                                    <span>{selectedTransaction.destination}</span>

                                    <span className="text-muted-foreground">Tags</span>
                                    <span>
                                        {selectedTransaction.tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedTransaction.tags.map((t) => (
                                                    <Badge key={t} variant="outline">{t}</Badge>
                                                ))}
                                            </div>
                                        ) : "—"}
                                    </span>

                                    <span className="text-muted-foreground">Budgets</span>
                                    <span>
                                        {selectedTransaction.budgets.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedTransaction.budgets.map((b) => (
                                                    <Badge key={b} variant="outline">{b}</Badge>
                                                ))}
                                            </div>
                                        ) : "—"}
                                    </span>

                                    <span className="text-muted-foreground">Attachments</span>
                                    <span>
                                        {selectedTransaction.attachments.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {selectedTransaction.attachments.map((a) => (
                                                    <button
                                                        key={a.id}
                                                        type="button"
                                                        onClick={() => handleOpenAttachment(a.id)}
                                                        className="text-left hover:underline"
                                                    >
                                                        {a.filename}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : "—"}
                                    </span>
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/transactions/${selectedTransaction.id}`)}>
                                    <FilePenLine />Edit
                                </Button>
                                <Alert
                                    button_text={<><Ban />Deactivate</>}
                                    title="Deactivate Transaction"
                                    description="This will mark the transaction inactive. It can be reactivated later from its edit page."
                                    action={() => handleDeactivate(selectedTransaction)}
                                />
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default TransactionListPage
