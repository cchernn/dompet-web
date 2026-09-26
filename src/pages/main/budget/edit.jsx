import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { UserPlus, UserMinus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form"
import {
    Table,
    TableCaption,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { getBudget, updateBudget, listBudgetTransactions } from "@/api/budgets"
import { listBudgetMembers, addBudgetMember, removeBudgetMember } from "@/api/budgetMembers"
import { usePaginatedList } from "@/hooks/use-paginated-list"

const nameFormSchema = z.object({
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be less than 255 characters" }),
})

function PaginationFooter({ page, totalPages, onPrevious, onNext }) {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={onPrevious}
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
                        onClick={onNext}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

function BudgetEditPage() {
    const { budget_id } = useParams()
    const navigate = useNavigate()
    const [budget, setBudget] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newMemberUserId, setNewMemberUserId] = useState("")
    const [addingMember, setAddingMember] = useState(false)

    const form = useForm({
        resolver: zodResolver(nameFormSchema),
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    const members = usePaginatedList(
        ({ page, pageSize }) => listBudgetMembers(budget_id, { page, pageSize })
    )
    const transactions = usePaginatedList(
        ({ page, pageSize }) => listBudgetTransactions(budget_id, { page, pageSize })
    )

    useEffect(() => {
        fetchBudget()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchBudget() {
        try {
            const { data } = await getBudget(budget_id)
            setBudget(data)
            form.reset({ name: data.name ?? "" })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const onSubmitName = async (values) => {
        const name = values.name?.trim()
        if (!name || name === budget?.name) {
            toast.info("Nothing to update")
            return
        }
        try {
            const { data } = await updateBudget(budget_id, { name })
            setBudget(data)
            toast.success("Budget updated")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleAddMember = async () => {
        const userId = newMemberUserId.trim()
        if (!userId) return
        setAddingMember(true)
        try {
            await addBudgetMember(budget_id, userId)
            toast.success("Member added")
            setNewMemberUserId("")
            members.reload()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setAddingMember(false)
        }
    }

    const handleRemoveMember = async (memberUserId) => {
        try {
            await removeBudgetMember(budget_id, memberUserId)
            toast.success("Member removed")
            members.reload()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 flex flex-col gap-4 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Budget ID: {budget_id}</CardTitle>
                </CardHeader>
                {loading ? (
                    <div className="w-full">
                        <Skeleton className="h-6 w-full my-2" />
                        <Skeleton className="h-6 w-full my-2" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant={budget?.is_active ? "secondary" : "outline"}>
                                {budget?.is_active ? "Active" : "Deleted"}
                            </Badge>
                        </div>
                        <Form {...form}>
                            <form className="w-full flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmitName)}>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Budget Name" {...field} />
                                            </FormControl>
                                            <FormDescription />
                                            <FormMessage>{errors.name?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex flex-col gap-2 w-full max-w-xs">
                                    <Button type="submit" disabled={isSubmitting}>Save Name</Button>
                                    <Button type="button" onClick={onBack}>Back</Button>
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </Card>

            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Members</CardTitle>
                </CardHeader>
                <div className="w-full flex flex-col gap-4">
                    <div className="overflow-x-auto w-full">
                        {members.loading ? (
                            <Skeleton className="h-6 w-full my-2" />
                        ) : members.items.length === 0 ? (
                            <div className="h-16 flex text-center items-center justify-center w-full">
                                <h2 className="text-sm text-muted-foreground">No Members Yet</h2>
                            </div>
                        ) : (
                            <Table className="min-w-full">
                                <TableCaption>
                                    <PaginationFooter
                                        page={members.page}
                                        totalPages={members.totalPages}
                                        onPrevious={members.previousPage}
                                        onNext={members.nextPage}
                                    />
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">User ID</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.items.map((member) => (
                                        <TableRow key={member.user_id}>
                                            <TableCell className="text-sm">{member.user_id}</TableCell>
                                            <TableCell className="flex justify-center items-center gap-1">
                                                <Alert
                                                    button_text={<UserMinus />}
                                                    title="Remove Member"
                                                    description="This will remove the member's access to this budget."
                                                    action={() => handleRemoveMember(member.user_id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 max-w-sm">
                        <Label htmlFor="new-member-user-id">Add Member</Label>
                        <div className="flex gap-2">
                            <Input
                                id="new-member-user-id"
                                placeholder="Cognito user ID"
                                value={newMemberUserId}
                                onChange={(event) => setNewMemberUserId(event.target.value)}
                            />
                            <Button type="button" onClick={handleAddMember} disabled={addingMember}>
                                <UserPlus />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Members are added by their raw Cognito user ID — there is no user search yet.
                        </p>
                    </div>
                </div>
            </Card>

            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Transactions in this Budget</CardTitle>
                </CardHeader>
                <div className="w-full overflow-x-auto">
                    {transactions.loading ? (
                        <Skeleton className="h-6 w-full my-2" />
                    ) : transactions.items.length === 0 ? (
                        <div className="h-16 flex text-center items-center justify-center w-full">
                            <h2 className="text-sm text-muted-foreground">No Transactions Yet</h2>
                        </div>
                    ) : (
                        <Table className="min-w-full">
                            <TableCaption>
                                <PaginationFooter
                                    page={transactions.page}
                                    totalPages={transactions.totalPages}
                                    onPrevious={transactions.previousPage}
                                    onNext={transactions.nextPage}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    This view may include deactivated transactions (a known backend limitation).
                                </p>
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Date</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Amount</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Currency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.items.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-sm">{format(new Date(tx.datetime), "d MMM yyyy")}</TableCell>
                                        <TableCell className="text-sm">{tx.name}</TableCell>
                                        <TableCell className="text-sm">{tx.type}</TableCell>
                                        <TableCell className="text-sm">{Number(tx.amount).toFixed(2)}</TableCell>
                                        <TableCell className="text-sm">{tx.currency_code}</TableCell>
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

export default BudgetEditPage
