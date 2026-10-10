import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { DateRange } from "react-day-picker"
import {
    Users,
    Trash2,
    FilePlus,
    X,
    FileText,
    Clock,
    CalendarIcon,
} from "lucide-react"
import { format, formatDistanceToNow, parse, startOfMonth } from "date-fns"
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
import { LoadingState } from "@/components/loading-state"
import { Badge } from "@/components/ui/badge"
import { UserBadge } from "@/components/user-badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import Alert from "@/lib/alertDialog"
import { toast } from "@/lib/toast"
import { searchBudgets, deleteBudget } from "@/api/budgets"
import { useCurrentUserId, isOwnedBy } from "@/hooks/use-current-user-id"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { useCachedResource } from "@/hooks/use-cached-resource"
import type { BudgetSearchResult } from "@/api/types"
import { BudgetInsights } from "./insights"

// Same raised page-size ceiling the Transactions filter dropdowns use — one
// call fetches every budget for the picker instead of paginating.
const FILTER_OPTIONS_PAGE_SIZE = 1000

const ALL = "__all__"

interface Filters {
    budget: string
    from: string
    to: string
}

// A stored "YYYY-MM-DD" string must never go through `new Date(str)` — that
// parses as UTC midnight and can render as the wrong local day.
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

function BudgetListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState<BudgetSearchResult | null>(null)
    const currentUserId = useCurrentUserId()
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = searchParams.get("tab") === "list" ? "list" : "insights"
    const setTab = (value: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            if (value === "list") next.set("tab", "list")
            else next.delete("tab")
            return next
        }, { replace: true })
    }

    const { data: budgetOptionsData } = useCachedResource("budgets:search", () => searchBudgets({ pageSize: FILTER_OPTIONS_PAGE_SIZE }))
    const budgetOptions: ComboboxOption[] = [
        { value: ALL, label: "All budgets" },
        ...(budgetOptionsData ?? []).map((b) => ({ value: b.name, label: b.name })),
    ]

    const [filters, setFilters] = useState<Filters>(() => ({
        budget: "",
        // Defaults to Month to Date for the Insights trend, rather than "All dates".
        from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
    }))
    const [dateRangeOpen, setDateRangeOpen] = useState(false)

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
    } = usePaginatedList(({ page, pageSize }) => searchBudgets({ page, pageSize, q: filters.budget || undefined }))

    const updateBudgetFilter = (value: string) => {
        setFilters((prev) => ({ ...prev, budget: value === ALL ? "" : value }))
        setPage(1)
        reload()
    }

    // react-day-picker's range onSelect fires once with {from, to: undefined}
    // after the first click, then {from, to} after the second.
    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setFilters((prev) => ({
            ...prev,
            from: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            to: range?.to ? format(range.to, "yyyy-MM-dd") : "",
        }))
        if (range?.from && range?.to) setDateRangeOpen(false)
    }

    const clearDateRange = () => {
        setFilters((prev) => ({ ...prev, from: "", to: "" }))
        setDateRangeOpen(false)
    }

    const clearFilters = () => {
        setFilters({ budget: "", from: "", to: "" })
        setPage(1)
        reload()
    }

    const hasFilters = filters.budget || filters.from || filters.to

    // Clicking the donut in the Insights tab scopes this same page down to
    // that one budget — stays on Insights, no tab switch.
    const handleDrilldown = (patch: Partial<Filters>) => {
        setFilters((prev) => ({ ...prev, ...patch }))
        setPage(1)
        reload()
    }

    interface Chip {
        key: string
        label: string
        value: string
        onRemove: () => void
    }

    const chips: Chip[] = (
        [
            filters.budget && { key: "budget", label: "Budget", value: filters.budget, onRemove: () => updateBudgetFilter(ALL) },
            (filters.from || filters.to) && {
                key: "date", label: "Date", value: formatDateRangeLabel(filters.from, filters.to), onRemove: clearDateRange,
            },
        ] as (Chip | "" | false)[]
    ).filter((chip): chip is Chip => Boolean(chip))

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
            <div className="flex flex-wrap items-center justify-between gap-4 m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add budget</Button>
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Card className="p-4 m-2 rounded-2xl shadow-md border">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1 w-56">
                        <Label>Budget</Label>
                        <Combobox
                            options={budgetOptions}
                            value={filters.budget || ALL}
                            onChange={updateBudgetFilter}
                            placeholder="All budgets"
                            searchPlaceholder="Search budgets"
                            emptyText="No budget found"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Date (Insights only)</Label>
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

            {tab === "insights" && (
                <div className="m-2">
                    <BudgetInsights filters={filters} onDrilldown={handleDrilldown} />
                </div>
            )}

            {tab === "list" && (
            <Card className="p-6 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <LoadingState />
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Owner</TableHead>
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
                                                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FileText className="size-3" />{budget.transaction_count}
                                                    </span>
                                                    {(budget.members ?? []).length > 1 && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Users className="size-3" />{budget.members.length}
                                                        </span>
                                                    )}
                                                    {budget.last_updated && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {formatDistanceToNow(new Date(budget.last_updated), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <UserBadge username={budget.owner_username} displayName={budget.owner_display_name} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
            )}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Budget</SheetTitle>
                        <SheetDescription className="sr-only">Budget details</SheetDescription>
                    </SheetHeader>
                    {selectedBudget && (() => {
                        // create_budget always adds the owner as a budget_members
                        // row too (so list_budgets/get_budget's own JOIN finds it),
                        // so `members` already includes them — filter their entry
                        // out here since the Owner row above already shows them.
                        const otherMembers = (selectedBudget.members ?? []).filter(
                            (username) => username !== selectedBudget.owner_username
                        )
                        return (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div className="text-xl font-semibold">{selectedBudget.name}</div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Owner</span>
                                    <UserBadge username={selectedBudget.owner_username} displayName={selectedBudget.owner_display_name} />

                                    <span className="text-muted-foreground">Transactions</span>
                                    <span className="inline-flex items-center gap-1">
                                        <FileText className="size-3" />{selectedBudget.transaction_count.toLocaleString()}
                                    </span>

                                    <span className="text-muted-foreground">Last Activity</span>
                                    <span>
                                        {selectedBudget.last_updated
                                            ? formatDistanceToNow(new Date(selectedBudget.last_updated), { addSuffix: true })
                                            : "No transactions yet"}
                                    </span>

                                    <span className="text-muted-foreground">Shared With</span>
                                    <span>
                                        {otherMembers.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {otherMembers.map((username, index) => (
                                                    <Badge key={`${username ?? "unknown"}-${index}`} variant="outline">
                                                        {username ?? "No profile yet"}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : "Just you"}
                                    </span>
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                {isOwnedBy(selectedBudget.owner_user_id, currentUserId) && (
                                    <>
                                        <Button onClick={() => navigate(`/budgets/${selectedBudget.id}`)}>
                                            <Users />Manage
                                        </Button>
                                        <Alert
                                            button_text={<><Trash2 />Delete</>}
                                            title="Confirm Delete"
                                            description="This action cannot be undone. Deleted budgets cannot be restored from this app."
                                            action={() => handleDelete(selectedBudget.id)}
                                        />
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/transactions?budgets=${encodeURIComponent(selectedBudget.name)}`)}
                                >
                                    <FileText />View Transactions
                                </Button>
                            </SheetFooter>
                        </>
                        )
                    })()}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default BudgetListPage
