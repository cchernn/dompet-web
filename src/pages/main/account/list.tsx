import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePenLine, FilePlus, Ban, RotateCcw } from "lucide-react"
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
import { toast } from "@/lib/toast"
import Alert from "@/lib/alertDialog"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { listAccounts, deactivateAccount, reactivateAccount } from "@/api/accounts"
import type { Account } from "@/api/types"

function AccountListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

    const {
        items: accounts,
        page,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listAccounts({ page, pageSize, includeInactive: true }))

    const handleAdd = () => {
        navigate(`/accounts/add`)
    }

    const openAccount = (account: Account) => {
        setSelectedAccount(account)
        setSheetOpen(true)
    }

    const handleDeactivate = async (id: string) => {
        try {
            await deactivateAccount(id)
            toast.success("Account deactivated.")
            reload()
            setSelectedAccount((prev) => (prev && prev.id === id ? { ...prev, is_active: false } : prev))
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleReactivate = async (id: string) => {
        try {
            await reactivateAccount(id)
            toast.success("Account reactivated.")
            reload()
            setSelectedAccount((prev) => (prev && prev.id === id ? { ...prev, is_active: true } : prev))
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add account</Button>
            </div>
            <Card className="p-6 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {
                        loading ?
                            <div>
                                <Skeleton className="h-6 w-full my-2" />
                                <Skeleton className="h-6 w-full my-2" />
                            </div>
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
                                                <span className="font-medium truncate flex items-center gap-2">
                                                    {account.name}
                                                    {!account.is_active && <Badge variant="outline">Inactive</Badge>}
                                                </span>
                                                {account.description && (
                                                    <span className="text-sm text-muted-foreground truncate">{account.description}</span>
                                                )}
                                            </div>
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
                                    <Badge variant={selectedAccount.is_active ? "secondary" : "outline"}>
                                        {selectedAccount.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <span className="text-muted-foreground">Code</span>
                                    <span>{selectedAccount.code}</span>

                                    <span className="text-muted-foreground">Description</span>
                                    <span>{selectedAccount.description ?? "—"}</span>
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/accounts/${selectedAccount.id}`)}>
                                    <FilePenLine />Edit
                                </Button>
                                {selectedAccount.is_active ? (
                                    <Alert
                                        button_text={<><Ban />Deactivate</>}
                                        title="Confirm Deactivate"
                                        description="This account will be marked inactive. You can reactivate it later."
                                        action={() => handleDeactivate(selectedAccount.id)}
                                    />
                                ) : (
                                    <Alert
                                        button_text={<><RotateCcw />Reactivate</>}
                                        title="Confirm Reactivate"
                                        description="This account will be marked active again."
                                        action={() => handleReactivate(selectedAccount.id)}
                                    />
                                )}
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default AccountListPage
