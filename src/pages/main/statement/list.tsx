import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { DateRange } from "react-day-picker"
import {
    FilePlus, X, CalendarIcon, Trash2, Repeat, Paperclip, FilePenLine, AlertTriangle,
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
import { searchStatements, deleteStatement } from "@/api/statements"
import { searchAccounts } from "@/api/accounts"
import { getAttachment } from "@/api/attachments"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { CURRENCIES } from "@/lib/currencies"
import type { StatementSearchResult, StatementStatus } from "@/api/types"

const FILTER_OPTIONS_PAGE_SIZE = 1000
const ALL = "__all__"

const STATUS_LABELS: Record<StatementStatus, string> = {
    pending: "Pending",
    received: "Received",
    overdue: "Overdue",
}

const STATUS_BADGE_CLASS: Record<StatementStatus, string> = {
    pending: "",
    received: "bg-green-600 text-white border-green-600",
    overdue: "",
}

interface Filters {
    q: string
    account: string
    status: StatementStatus | ""
    recurring: "" | "true" | "false"
    from: string
    to: string
}

const EMPTY_FILTERS: Filters = { q: "", account: "", status: "", recurring: "", from: "", to: "" }

const parseFilterDate = (value?: string) => (value ? parse(value, "yyyy-MM-dd", new Date()) : undefined)

function formatDateRangeLabel(from?: string, to?: string) {
    const fromDate = parseFilterDate(from)
    const toDate = parseFilterDate(to)
    if (!fromDate && !toDate) return "All statement dates"
    if (fromDate && toDate) {
        return fromDate.getFullYear() === toDate.getFullYear()
            ? `${format(fromDate, "d MMM")} – ${format(toDate, "d MMM yyyy")}`
            : `${format(fromDate, "d MMM yyyy")} – ${format(toDate, "d MMM yyyy")}`
    }
    if (fromDate) return `From ${format(fromDate, "d MMM yyyy")}`
    return `Until ${format(toDate!, "d MMM yyyy")}`
}

function formatBalance(value: string | null | undefined, currency?: string | null) {
    if (value == null) return null
    const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency ?? ""
    return `${symbol} ${parseFloat(value).toFixed(2)}`
}

function StatementListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedStatement, setSelectedStatement] = useState<StatementSearchResult | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()

    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: FILTER_OPTIONS_PAGE_SIZE }))
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
        items: statements,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => searchStatements({
        page, pageSize,
        q: filters.q || undefined,
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

    const hasFilters = filters.q || filters.account || filters.status || filters.recurring || filters.from || filters.to

    interface Chip {
        key: string
        label: string
        value: string
        onRemove: () => void
    }

    const chips: Chip[] = (
        [
            filters.q && { key: "q", label: "Search", value: filters.q, onRemove: () => updateFilter("q", "") },
            filters.account && { key: "account", label: "Account", value: filters.account, onRemove: () => updateFilter("account", "") },
            filters.status && { key: "status", label: "Status", value: STATUS_LABELS[filters.status as StatementStatus], onRemove: () => updateFilter("status", "") },
            filters.recurring && { key: "recurring", label: "Recurring", value: filters.recurring === "true" ? "Yes" : "No", onRemove: () => updateFilter("recurring", "") },
            (filters.from || filters.to) && {
                key: "date", label: "Statement Date", value: formatDateRangeLabel(filters.from, filters.to), onRemove: clearDateRange,
            },
        ] as (Chip | "" | false)[]
    ).filter((chip): chip is Chip => Boolean(chip))

    const handleAdd = () => navigate("/statements/add")

    const openStatement = (statement: StatementSearchResult) => {
        setSelectedStatement(statement)
        setSheetOpen(true)
    }

    const handleOpenAttachment = async (attachmentId: string) => {
        // Search results only carry the attachment id, not a download_url
        // (that's only ever generated for a single GET /attachments/{id}) —
        // same pattern as the Bills list page.
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
            await deleteStatement(id)
            toast.success("Statement deleted")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Statements</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add statement</Button>
            </div>

            <Card className="p-4 m-2 rounded-2xl shadow-md border">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1 w-48">
                        <Label>Search</Label>
                        <Input
                            placeholder="Search by account or notes"
                            value={filters.q}
                            onChange={(e) => updateFilter("q", e.target.value)}
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
                                { value: "pending", label: "Pending" },
                                { value: "received", label: "Received" },
                                { value: "overdue", label: "Overdue" },
                            ]}
                            value={filters.status || ALL}
                            onChange={(value) => updateFilter("status", value === ALL ? "" : value as StatementStatus)}
                            placeholder="All statuses"
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-40">
                        <Label>Recurring</Label>
                        <Combobox
                            options={[
                                { value: ALL, label: "All statements" },
                                { value: "true", label: "Recurring only" },
                                { value: "false", label: "One-off only" },
                            ]}
                            value={filters.recurring || ALL}
                            onChange={(value) => updateFilter("recurring", value === ALL ? "" : value as "true" | "false")}
                            placeholder="All statements"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Statement Date</Label>
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
                    ) : statements.length === 0 ? (
                        <div className="h-20 flex text-center items-center justify-center w-full">
                            <h2>No Statements Available</h2>
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Account</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Balance</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statements.map((statement) => (
                                    <TableRow
                                        key={statement.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openStatement(statement)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openStatement(statement)
                                            }
                                        }}
                                    >
                                        <TableCell className="py-3 text-sm">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    {format(parse(statement.statement_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}
                                                    {statement.status === "overdue" && <AlertTriangle className="size-3.5 text-destructive" />}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    Period {format(parse(statement.period_start, "yyyy-MM-dd", new Date()), "d MMM")} – {format(parse(statement.period_end, "yyyy-MM-dd", new Date()), "d MMM yyyy")}
                                                </span>
                                                {statement.received_date && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Received {format(parse(statement.received_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-medium truncate">{statement.account}</span>
                                                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    {statement.is_recurring && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Repeat className="size-3" />
                                                        </span>
                                                    )}
                                                    {statement.attachments.length > 0 && (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button type="button" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                                                    <Paperclip className="size-3" />{statement.attachments.length}
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent align="end" className="w-56 p-2">
                                                                <div className="flex flex-col gap-1">
                                                                    {statement.attachments.map((a) => (
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
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-sm">
                                            <div className="flex flex-col gap-0.5">
                                                <span>{formatBalance(statement.closing_balance, statement.currency) ?? "—"}</span>
                                                {statement.opening_balance != null && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Opening {formatBalance(statement.opening_balance, statement.currency)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant={statement.status === "overdue" ? "destructive" : statement.status === "pending" ? "secondary" : "default"} className={STATUS_BADGE_CLASS[statement.status]}>
                                                {STATUS_LABELS[statement.status]}
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
                        <SheetTitle>Statement</SheetTitle>
                        <SheetDescription className="sr-only">Statement details</SheetDescription>
                    </SheetHeader>
                    {selectedStatement && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div>
                                    <div className="text-xl font-semibold">{selectedStatement.account}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={selectedStatement.status === "overdue" ? "destructive" : selectedStatement.status === "pending" ? "secondary" : "default"} className={STATUS_BADGE_CLASS[selectedStatement.status]}>
                                            {STATUS_LABELS[selectedStatement.status]}
                                        </Badge>
                                        {selectedStatement.is_recurring && <Badge variant="outline"><Repeat className="size-3" />Recurring</Badge>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Statement Date</span>
                                    <span>{format(parse(selectedStatement.statement_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}</span>

                                    <span className="text-muted-foreground">Period</span>
                                    <span>
                                        {format(parse(selectedStatement.period_start, "yyyy-MM-dd", new Date()), "d MMM yyyy")} – {format(parse(selectedStatement.period_end, "yyyy-MM-dd", new Date()), "d MMM yyyy")}
                                    </span>

                                    <span className="text-muted-foreground">Received</span>
                                    <span>{selectedStatement.received_date ? format(parse(selectedStatement.received_date, "yyyy-MM-dd", new Date()), "d MMM yyyy") : "—"}</span>

                                    <span className="text-muted-foreground">Opening Balance</span>
                                    <span>{formatBalance(selectedStatement.opening_balance, selectedStatement.currency) ?? "—"}</span>

                                    <span className="text-muted-foreground">Closing Balance</span>
                                    <span>{formatBalance(selectedStatement.closing_balance, selectedStatement.currency) ?? "—"}</span>

                                    <span className="text-muted-foreground">Notes</span>
                                    <span>{selectedStatement.notes || "—"}</span>

                                    <span className="text-muted-foreground">Attachments</span>
                                    <span>
                                        {selectedStatement.attachments.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {selectedStatement.attachments.map((a) => (
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
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/statements/${selectedStatement.id}`)}>
                                    <FilePenLine />Edit
                                </Button>
                                <Alert
                                    button_text={<><Trash2 />Delete</>}
                                    title="Confirm Delete"
                                    description="This action cannot be undone. Deleted statements cannot be restored from this app."
                                    action={() => handleDelete(selectedStatement.id)}
                                />
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default StatementListPage
