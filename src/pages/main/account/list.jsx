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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Alert from "@/lib/alertDialog"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { listAccounts, deactivateAccount, reactivateAccount } from "@/api/accounts"

function AccountListPage() {
    const navigate = useNavigate()
    const {
        items: accounts,
        page,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listAccounts({ page, pageSize }))

    const handleEdit = (id) => {
        navigate(`/accounts/${id}`)
    }

    const handleAdd = () => {
        navigate(`/accounts/add`)
    }

    const handleDeactivate = async (id) => {
        try {
            await deactivateAccount(id)
            toast.success("Account deactivated.")
            reload()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleReactivate = async (id) => {
        try {
            await reactivateAccount(id)
            toast.success("Account reactivated.")
            reload()
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-center gap-3 m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add</Button>
                {!loading && <span className="text-sm text-muted-foreground">{totalCount} account{totalCount === 1 ? "" : "s"}</span>}
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Code</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Description</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Status</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell className="text-sm">{account.code}</TableCell>
                                        <TableCell className="text-sm">{account.name}</TableCell>
                                        <TableCell className="text-sm truncate max-w-[240px]" title={account.description}>{account.description}</TableCell>
                                        <TableCell className="text-sm">
                                            <Badge variant={account.is_active ? "secondary" : "outline"}>
                                                {account.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex justify-center items-center gap-1">
                                            <Button onClick={() => handleEdit(account.id)}><FilePenLine /></Button>
                                            {account.is_active ? (
                                                <Alert
                                                    button_text={<Ban />}
                                                    title="Confirm Deactivate"
                                                    description="This account will be marked inactive. You can reactivate it later."
                                                    action={() => handleDeactivate(account.id)}
                                                />
                                            ) : (
                                                <Alert
                                                    button_text={<RotateCcw />}
                                                    title="Confirm Reactivate"
                                                    description="This account will be marked active again."
                                                    action={() => handleReactivate(account.id)}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>
            </Card>
        </div>
    )
}

export default AccountListPage
