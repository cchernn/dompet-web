import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { DateRange } from "react-day-picker"
import {
    FilePlus, X, CalendarIcon, Trash2, Repeat, Paperclip, FilePenLine, AlertTriangle, ArrowLeftRight,
} from "lucide-react"
import { format, parse, startOfMonth } from "date-fns"
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
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/loading-state"
import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import Alert from "@/lib/alertDialog"
import { toast } from "@/lib/toast"
import { searchBills, deleteBill } from "@/api/bills"
import { searchCategories } from "@/api/categories"
import { searchAccounts } from "@/api/accounts"
import { getAttachment } from "@/api/attachments"
import { cn } from "@/lib/utils"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { CURRENCIES } from "@/lib/currencies"
import type { BillSearchResult, BillStatus } from "@/api/types"

const FILTER_OPTIONS_PAGE_SIZE = 1000
const ALL = "__all__"

const STATUS_LABELS: Record<BillStatus, string> = {
    unpaid: "Unpaid",
    partial: "Partially Paid",
    paid: "Paid",
}

const STATUS_BADGE_CLASS: Record<BillStatus, string> = {
    unpaid: "",
    partial: "bg-yellow-600 text-white border-yellow-600",
    paid: "bg-green-600 text-white border-green-600",
}

interface Filters {
    q: string
    category: string
    account: string
    status: BillStatus | ""
    recurring: "" | "true" | "false"
    from: string
    to: string
}

const EMPTY_FILTERS: Filters = { q: "", category: "", account: "", status: "", recurring: "", from: "", to: "" }

const parseFilterDate = (value?: string) => (value ? parse(value, "yyyy-MM-dd", new Date()) : undefined)

function formatDateRangeLabel(from?: string, to?: string) {
    const fromDate = parseFilterDate(from)
    const toDate = parseFilterDate(to)
    if (!fromDate && !toDate) return "All bill dates"
    if (fromDate && toDate) {
        return fromDate.getFullYear() === toDate.getFullYear()
            ? `${format(fromDate, "d MMM")} – ${format(toDate, "d MMM yyyy")}`
            : `${format(fromDate, "d MMM yyyy")} – ${format(toDate, "d MMM yyyy")}`
    }
    if (fromDate) return `From ${format(fromDate, "d MMM yyyy")}`
    return `Until ${format(toDate!, "d MMM yyyy")}`
}

function BillListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedBill, setSelectedBill] = useState<BillSearchResult | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()

    const { data: categoriesData } = useCachedResource("categories:search", () => searchCategories({ pageSize: FILTER_OPTIONS_PAGE_SIZE }))
    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: FILTER_OPTIONS_PAGE_SIZE }))
    const categoryOptions: ComboboxOption[] = [
        { value: ALL, label: "All categories" },
        ...(categoriesData ?? []).map((c) => ({ value: c.name, label: c.name })),
    ]
    const accountOptions: ComboboxOption[] = [
        { value: ALL, label: "All accounts" },
        ...(accountsData ?? []).map((a) => ({ value: a.name, label: a.name })),
    ]

    const [filters, setFilters] = useState<Filters>(() => ({
        ...EMPTY_FILTERS,
        q: searchParams.get("q") ?? "",
    }))
    const [dateRangeOpen, setDateRangeOpen] = useState(false)

    const {
        items: bills,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => searchBills({
        page, pageSize,
        q: filters.q || undefined,
        category: filters.category || undefined,
        account: filters.account || undefined,
        status: filters.status || undefined,
        isRecurring: filters.recurring === "" ? undefined : filters.recurring === "true",
        from: filters.from || undefined,
        to: filters.to || undefined,
    }))

    const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1)
        reload()
    }

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setFilters((prev) => ({
            ...prev,
            from: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            to: range?.to ? format(range.to, "yyyy-MM-dd") : "",
        }))
        if (range?.from && range?.to) setDateRangeOpen(false)
        setPage(1)
        reload()
    }

    const clearDateRange = () => {
        setFilters((prev) => ({ ...prev, from: "", to: "" }))
        setDateRangeOpen(false)
        setPage(1)
        reload()
    }

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS)
        setSearchParams({}, { replace: true })
        setPage(1)
        reload()
    }

    const hasFilters = filters.q || filters.category || filters.account || filters.status || filters.recurring || filters.from || filters.to

    interface Chip {
        key: string
        label: string
        value: string
        onRemove: () => void
    }

    const chips: Chip[] = (
        [
            filters.q && { key: "q", label: "Name", value: filters.q, onRemove: () => updateFilter("q", "") },
            filters.category && { key: "category", label: "Category", value: filters.category, onRemove: () => updateFilter("category", "") },
            filters.account && { key: "account", label: "Account", value: filters.account, onRemove: () => updateFilter("account", "") },
            filters.status && { key: "status", label: "Status", value: STATUS_LABELS[filters.status as BillStatus], onRemove: () => updateFilter("status", "") },
            filters.recurring && { key: "recurring", label: "Recurring", value: filters.recurring === "true" ? "Yes" : "No", onRemove: () => updateFilter("recurring", "") },
            (filters.from || filters.to) && {
                key: "date", label: "Bill Date", value: formatDateRangeLabel(filters.from, filters.to), onRemove: clearDateRange,
            },
        ] as (Chip | "" | false)[]
    ).filter((chip): chip is Chip => Boolean(chip))

    const handleAdd = () => navigate("/bills/add")

    const openBill = (bill: BillSearchResult) => {
        setSelectedBill(bill)
        setSheetOpen(true)
    }

    const handleOpenAttachment = async (attachmentId: string) => {
        // Search results only carry the attachment id, not a download_url
        // (that's only ever generated for a single GET /attachments/{id}) —
        // same pattern as the Transactions list page.
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
            await deleteBill(id)
            toast.success("Bill deleted")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Bills</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add bill</Button>
            </div>

            <Card className="p-4 m-2 rounded-2xl shadow-md border">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1 w-48">
                        <Label>Name</Label>
                        <Input
                            placeholder="Search by name"
                            value={filters.q}
                            onChange={(e) => updateFilter("q", e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-48">
                        <Label>Category</Label>
                        <Combobox
                            options={categoryOptions}
                            value={filters.category || ALL}
                            onChange={(value) => updateFilter("category", value === ALL ? "" : value)}
                            placeholder="All categories"
                            searchPlaceholder="Search categories"
                            emptyText="No category found"
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-48">
                        <Label>Account</Label>
                        <Combobox
                            options={accountOptions}
                            value={filters.account || ALL}
                            onChange={(value) => updateFilter("account", value === ALL ? "" : value)}
                            placeholder="All accounts"
                            searchPlaceholder="Search accounts"
                            emptyText="No account found"
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-40">
                        <Label>Status</Label>
                        <Combobox
                            options={[
                                { value: ALL, label: "All statuses" },
                                { value: "unpaid", label: "Unpaid" },
                                { value: "partial", label: "Partially Paid" },
                                { value: "paid", label: "Paid" },
                            ]}
                            value={filters.status || ALL}
                            onChange={(value) => updateFilter("status", value === ALL ? "" : value as BillStatus)}
                            placeholder="All statuses"
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-40">
                        <Label>Recurring</Label>
                        <Combobox
                            options={[
                                { value: ALL, label: "All bills" },
                                { value: "true", label: "Recurring only" },
                                { value: "false", label: "One-off only" },
                            ]}
                            value={filters.recurring || ALL}
                            onChange={(value) => updateFilter("recurring", value === ALL ? "" : value as "true" | "false")}
                            placeholder="All bills"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Bill Date</Label>
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
                                    defaultMonth={parseFilterDate(filters.from) ?? startOfMonth(new Date())}
                                    initialFocus
                                />
                                <div className="p-2 border-t flex justify-end">
                                    <Button type="button" variant="ghost" size="sm" onClick={clearDateRange}>Clear</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

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

            <Card className="p-6 m-2 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <LoadingState />
                    ) : bills.length === 0 ? (
                        <div className="h-20 flex text-center items-center justify-center w-full">
                            <h2>No Bills Available</h2>
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Date</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Amount</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.map((bill) => (
                                    <TableRow
                                        key={bill.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openBill(bill)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openBill(bill)
                                            }
                                        }}
                                    >
                                        <TableCell className="py-3 text-sm">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    {format(parse(bill.bill_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}
                                                    {bill.is_overdue && <AlertTriangle className="size-3.5 text-destructive" />}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    Due {format(parse(bill.due_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}
                                                </span>
                                                {bill.status === "paid" && bill.transactions.length > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Paid {format(new Date(bill.transactions[bill.transactions.length - 1].datetime), "d MMM yyyy")}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-medium truncate">{bill.name}</span>
                                                <span className="text-xs text-muted-foreground truncate">{bill.account ?? "—"}</span>
                                                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="truncate">{bill.category ?? "—"}</span>
                                                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        {bill.is_recurring && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Repeat className="size-3" />
                                                            </span>
                                                        )}
                                                        {bill.attachments.length > 0 && (
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                                                                        <Paperclip className="size-3" />{bill.attachments.length}
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent align="end" className="w-56 p-2">
                                                                    <div className="flex flex-col gap-1">
                                                                        {bill.attachments.map((a) => (
                                                                            <button
                                                                                key={a.id}
                                                                                type="button"
                                                                                onClick={() => handleOpenAttachment(a.id)}
                                                                                className="text-left text-sm truncate hover:underline"
                                                                            >
                                                                                {a.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )}
                                                        {bill.transactions.length > 0 && (
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                                                                        <ArrowLeftRight className="size-3" />{bill.transactions.length}
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent align="end" className="w-56 p-2">
                                                                    <div className="flex flex-col gap-1">
                                                                        {bill.transactions.map((t) => (
                                                                            <button
                                                                                key={t.id}
                                                                                type="button"
                                                                                onClick={() => navigate(`/transactions/${t.id}`)}
                                                                                className="text-left text-sm truncate hover:underline"
                                                                            >
                                                                                {t.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )}
                                                    </div>
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-sm">
                                            <div className="flex flex-col gap-0.5">
                                                <span>
                                                    {CURRENCIES.find((c) => c.code === bill.currency)?.symbol ?? bill.currency} {parseFloat(bill.amount).toFixed(2)}
                                                </span>
                                                {(() => {
                                                    const balance = Math.max(0, parseFloat(bill.amount) - parseFloat(bill.paid_amount))
                                                    const symbol = CURRENCIES.find((c) => c.code === bill.currency)?.symbol ?? bill.currency
                                                    return (
                                                        <span className={cn("text-xs", balance > 0 ? "text-destructive" : "text-green-600")}>
                                                            {balance > 0 ? `-${symbol} ${balance.toFixed(2)}` : `${symbol} 0.00`}
                                                        </span>
                                                    )
                                                })()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={bill.status === "unpaid" ? "secondary" : "default"} className={STATUS_BADGE_CLASS[bill.status]}>
                                                {STATUS_LABELS[bill.status]}
                                            </Badge>
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
                        <SheetTitle>Bill</SheetTitle>
                        <SheetDescription className="sr-only">Bill details</SheetDescription>
                    </SheetHeader>
                    {selectedBill && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div>
                                    <div className="text-xl font-semibold">{selectedBill.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={selectedBill.status === "unpaid" ? "secondary" : "default"} className={STATUS_BADGE_CLASS[selectedBill.status]}>
                                            {STATUS_LABELS[selectedBill.status]}
                                        </Badge>
                                        {selectedBill.is_overdue && <Badge variant="destructive">Overdue</Badge>}
                                        {selectedBill.is_recurring && <Badge variant="outline"><Repeat className="size-3" />Recurring</Badge>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Bill Date</span>
                                    <span>{format(parse(selectedBill.bill_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}</span>

                                    <span className="text-muted-foreground">Due Date</span>
                                    <span>{format(parse(selectedBill.due_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}</span>

                                    <span className="text-muted-foreground">Amount</span>
                                    <span>
                                        {CURRENCIES.find((c) => c.code === selectedBill.currency)?.symbol ?? selectedBill.currency} {parseFloat(selectedBill.amount).toFixed(2)}
                                    </span>

                                    <span className="text-muted-foreground">Paid</span>
                                    <span>
                                        {CURRENCIES.find((c) => c.code === selectedBill.currency)?.symbol ?? selectedBill.currency} {parseFloat(selectedBill.paid_amount).toFixed(2)}
                                    </span>

                                    <span className="text-muted-foreground">Category</span>
                                    <span>{selectedBill.category ?? "—"}</span>

                                    <span className="text-muted-foreground">Account</span>
                                    <span>{selectedBill.account ?? "—"}</span>

                                    <span className="text-muted-foreground">Attachments</span>
                                    <span>
                                        {selectedBill.attachments.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {selectedBill.attachments.map((a) => (
                                                    <button
                                                        key={a.id}
                                                        type="button"
                                                        onClick={() => handleOpenAttachment(a.id)}
                                                        className="text-left hover:underline"
                                                    >
                                                        {a.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : "—"}
                                    </span>

                                    <span className="text-muted-foreground">Transactions</span>
                                    <span>
                                        {selectedBill.transactions.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {selectedBill.transactions.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => navigate(`/transactions/${t.id}`)}
                                                        className="text-left hover:underline"
                                                    >
                                                        {t.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : "—"}
                                    </span>
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/bills/${selectedBill.id}`)}>
                                    <FilePenLine />Edit
                                </Button>
                                <Alert
                                    button_text={<><Trash2 />Delete</>}
                                    title="Confirm Delete"
                                    description="This action cannot be undone. Deleted bills cannot be restored from this app."
                                    action={() => handleDelete(selectedBill.id)}
                                />
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default BillListPage
