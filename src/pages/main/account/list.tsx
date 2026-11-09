import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePenLine, FilePlus, X, FileText, MapPin } from "lucide-react"
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
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { searchAccounts } from "@/api/accounts"
import type { AccountSearchResult, AccountType } from "@/api/types"

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    bank: "Bank",
    wallet: "Wallet",
    merchant: "Merchant",
    online: "Online",
    utility: "Utility",
    subscription: "Subscription",
    other: "Other",
}

const ALL = "__all__"

function AccountListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<AccountSearchResult | null>(null)
    const [type, setType] = useState<AccountType | "">("")
    const [search, setSearch] = useState("")

    const {
        items: accounts,
        page,
        setPage,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) =>
        searchAccounts({ page, pageSize, type: type || undefined, q: search || undefined })
    )

    const handleAdd = () => navigate("/accounts/add")

    const openAccount = (account: AccountSearchResult) => {
        setSelectedAccount(account)
        setSheetOpen(true)
    }

    const updateType = (value: string) => {
        setType(value === ALL ? "" : (value as AccountType))
        setPage(1)
        reload()
    }

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
        setType("")
        setSearch("")
        setPage(1)
        reload()
    }

    const hasFilters = type || search

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add account</Button>
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

                    <div className="flex flex-col gap-1">
                        <Label>Type</Label>
                        <Select value={type || ALL} onValueChange={updateType}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All types</SelectItem>
                                {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasFilters && (
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            <X />Clear filters
                        </Button>
                    )}
                </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {
                        loading ?
                            <LoadingState />
                        :
                        accounts.length === 0 ?
                            <div className="h-20 flex text-center items-center justify-center w-full">
                                <h2>No Accounts Available</h2>
                            </div>
                        :
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Account</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow
                                        key={account.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openAccount(account)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openAccount(account)
                                            }
                                        }}
                                    >
                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-medium truncate">{account.name}</span>
                                                {account.description && (
                                                    <span className="text-sm text-muted-foreground truncate">{account.description}</span>
                                                )}
                                                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FileText className="size-3" />{account.transaction_count}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="size-3" />{account.location_count}
                                                    </span>
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant="outline">{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Account</SheetTitle>
                        <SheetDescription className="sr-only">Account details</SheetDescription>
                    </SheetHeader>
                    {selectedAccount && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-semibold">{selectedAccount.name}</div>
                                </div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Code</span>
                                    <span>{selectedAccount.code}</span>

                                    <span className="text-muted-foreground">Type</span>
                                    <span>{ACCOUNT_TYPE_LABELS[selectedAccount.type]}</span>

                                    <span className="text-muted-foreground">Description</span>
                                    <span>{selectedAccount.description ?? "—"}</span>

                                    <span className="text-muted-foreground">Transactions</span>
                                    <span className="inline-flex items-center gap-1">
                                        <FileText className="size-3" />{selectedAccount.transaction_count.toLocaleString()}
                                    </span>

                                    <span className="text-muted-foreground">Locations</span>
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="size-3" />{selectedAccount.location_count.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/accounts/${selectedAccount.id}`)}>
                                    <FilePenLine />Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/transactions?source=${encodeURIComponent(selectedAccount.name)}`)}
                                >
                                    <FileText />View Transactions
                                </Button>
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default AccountListPage
