import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CalendarIcon, Repeat, Download, Trash2 } from "lucide-react"
import { format, parse } from "date-fns"
import { toast } from "@/lib/toast"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/loading-state"
import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { LinkedItemsSection } from "@/components/linked-items-section"
import Alert from "@/lib/alertDialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { useCurrentUserId, isOwnedBy } from "@/hooks/use-current-user-id"
import { getBill, updateBill, deleteBill } from "@/api/bills"
import { listBillPayments, addBillPayment, deleteBillPayment } from "@/api/billPayments"
import { listBillAttachments, linkBillAttachment, unlinkBillAttachment } from "@/api/billAttachments"
import { listBillBudgets, linkBillBudget, unlinkBillBudget } from "@/api/billBudgets"
import { listAttachments, getAttachment } from "@/api/attachments"
import { listBudgets } from "@/api/budgets"
import { searchAccounts } from "@/api/accounts"
import { searchCategories } from "@/api/categories"
import { CURRENCIES } from "@/lib/currencies"
import type { ApiResult } from "@/lib/apiClient"
import type { Attachment, Bill, BillPatch, BillPayment, BillStatus, Budget } from "@/api/types"

const ACCOUNT_CATEGORY_PAGE_SIZE = 1000

const formSchema = z.object({
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be less than 255 characters" }),
    amount: z.coerce.number()
        .min(0, { message: "Amount must be zero or greater" })
        .transform((val) => parseFloat(val.toFixed(2))),
    currency_code: z.string().length(3, { message: "Select a currency" }),
    category_id: z.string().nullable().optional(),
    account_id: z.string().nullable().optional(),
    bill_date: z.date({ required_error: "Bill date is required" }),
    // Optional — defaults to bill_date server-side if left blank.
    due_date: z.date().nullable().optional(),
})

const paymentFormSchema = z.object({
    amount_paid: z.string(), // left as text — blank means "use the full bill amount" server-side
    paid_date: z.date({ required_error: "Paid date is required" }),
    notes: z.string().optional(),
})

const STATUS_META: Record<BillStatus, { label: string; className: string }> = {
    unpaid: { label: "Unpaid", className: "border-transparent" },
    partial: { label: "Partially Paid", className: "bg-yellow-600 text-white border-yellow-600" },
    paid: { label: "Paid", className: "bg-green-600 text-white border-green-600" },
}

function BillEditPage() {
    const { bill_id } = useParams<{ bill_id: string }>()
    const navigate = useNavigate()

    const [bill, setBill] = useState<Bill | null>(null)
    const currentUserId = useCurrentUserId()
    const owned = isOwnedBy(bill?.user_id, currentUserId)
    const [loading, setLoading] = useState(true)

    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const { data: categoriesData } = useCachedResource("categories:search", () => searchCategories({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const { data: attachmentsData } = useCachedResource("attachments:list", () => listAttachments({ pageSize: 100 }))
    const { data: budgetsData } = useCachedResource("budgets:list", () => listBudgets({ pageSize: 100 }))
    const accountOptions: ComboboxOption[] = (accountsData ?? []).map((a) => ({ value: a.id, label: a.name }))
    const categoryOptions: ComboboxOption[] = (categoriesData ?? []).map((c) => ({ value: c.id, label: c.name }))
    const attachmentOptions: ComboboxOption[] = (attachmentsData ?? []).map((a) => ({ value: a.id, label: a.filename }))
    const budgetOptions: ComboboxOption[] = (budgetsData ?? []).map((b) => ({ value: b.id, label: b.name }))

    const [linkedAttachments, setLinkedAttachments] = useState<Attachment[]>([])
    const [linkedAttachmentsLoading, setLinkedAttachmentsLoading] = useState(true)
    const [linkedBudgets, setLinkedBudgets] = useState<Budget[]>([])
    const [linkedBudgetsLoading, setLinkedBudgetsLoading] = useState(true)

    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) })
    const { formState: { errors, isSubmitting } } = form

    const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: { amount_paid: "", paid_date: new Date(), notes: "" },
    })

    // GET .../payments (like .../attachments and .../budgets below) is still
    // strictly owner-gated server-side regardless of the bill_budgets RLS
    // widening (see _require_owned_bill in db/bill_payment.py) — a budget
    // co-member can now see this bill show up in their own Bills list (via
    // the RLS-only vw_bills view), but opening it here as a non-owner would
    // 404 on every one of these sub-resource calls. Short-circuit to an
    // empty page instead of letting that happen; the real fetch kicks in
    // once `owned` is confirmed, via the effect below.
    const payments = usePaginatedList(
        ({ page, pageSize }): Promise<ApiResult<BillPayment[]>> =>
            owned ? listBillPayments(bill_id!, { page, pageSize }) : Promise.resolve({ data: [], metadata: {} })
    )

    const fetchBill = async () => {
        try {
            const { data } = await getBill(bill_id!)
            setBill(data)
            form.reset({
                name: data.name ?? "",
                amount: parseFloat(data.amount),
                currency_code: data.currency_code,
                category_id: data.category_id ?? null,
                account_id: data.account_id ?? null,
                bill_date: parse(data.bill_date, "yyyy-MM-dd", new Date()),
                due_date: parse(data.due_date, "yyyy-MM-dd", new Date()),
            })
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const fetchLinkedAttachments = async () => {
        setLinkedAttachmentsLoading(true)
        try {
            const { data } = await listBillAttachments(bill_id!, { pageSize: 100 })
            setLinkedAttachments(data)
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setLinkedAttachmentsLoading(false)
        }
    }

    const fetchLinkedBudgets = async () => {
        setLinkedBudgetsLoading(true)
        try {
            const { data } = await listBillBudgets(bill_id!, { pageSize: 100 })
            setLinkedBudgets(data)
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setLinkedBudgetsLoading(false)
        }
    }

    useEffect(() => {
        fetchBill()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bill_id])

    // Deferred until ownership is confirmed (see the comment on `payments`
    // above) — avoids a guaranteed 404 toast from these owner-only
    // sub-resource endpoints when a budget co-member opens a shared bill
    // they don't own.
    useEffect(() => {
        if (!owned) return
        fetchLinkedAttachments()
        fetchLinkedBudgets()
        payments.reload()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [owned])

    // Derived client-side from the payments page already on hand — avoids a
    // second round trip just to get what GET /bills/search would've told us.
    const paidAmount = payments.items.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0)
    const billAmount = bill ? parseFloat(bill.amount) : 0
    const status: BillStatus = paidAmount >= billAmount && billAmount > 0 ? "paid" : paidAmount > 0 ? "partial" : "unpaid"
    const isOverdue = !!bill && status !== "paid" && parse(bill.due_date, "yyyy-MM-dd", new Date()) < new Date(new Date().toDateString())

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const patch: BillPatch = {
                name: data.name,
                amount: data.amount,
                currency_code: data.currency_code,
                category_id: data.category_id || undefined,
                account_id: data.account_id || undefined,
                bill_date: format(data.bill_date, "yyyy-MM-dd"),
                due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : undefined,
            }
            const { data: updated } = await updateBill(bill_id!, patch)
            setBill(updated)
            toast.success("Bill updated")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onRecordPayment = async (data: z.infer<typeof paymentFormSchema>) => {
        try {
            await addBillPayment(bill_id!, {
                amount_paid: data.amount_paid.trim() ? parseFloat(data.amount_paid) : undefined,
                paid_date: format(data.paid_date, "yyyy-MM-dd"),
                notes: data.notes?.trim() || undefined,
            })
            toast.success("Payment recorded")
            paymentForm.reset({ amount_paid: "", paid_date: new Date(), notes: "" })
            payments.reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleDeletePayment = async (paymentId: string) => {
        try {
            await deleteBillPayment(bill_id!, paymentId)
            toast.success("Payment removed")
            payments.reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleOpenAttachment = async (attachmentId: string) => {
        const newTab = window.open("", "_blank")
        try {
            const { data } = await getAttachment(attachmentId)
            if (newTab && data.download_url) newTab.location.href = data.download_url
        } catch (error) {
            if (newTab) newTab.close()
            toast.error((error as Error).message)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteBill(bill_id!)
            toast.success("Bill deleted")
            navigate("/bills")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 flex flex-col gap-4 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4 w-full">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle>Bill ID: {bill_id}</CardTitle>
                        {bill && owned && (
                            <Alert
                                button_text={<><Trash2 />Delete</>}
                                title="Delete Bill"
                                description="This permanently deactivates this occurrence. It cannot be restored from this app."
                                action={handleDelete}
                            />
                        )}
                    </div>
                </CardHeader>
                {loading || currentUserId === undefined ? (
                    <LoadingState />
                ) : !owned ? (
                    <p className="text-sm text-muted-foreground">
                        This bill belongs to another user, so it can&apos;t be edited here.
                    </p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant={bill?.is_active ? "secondary" : "outline"}>
                                {bill?.is_active ? "Active" : "Deleted"}
                            </Badge>
                            <Badge className={STATUS_META[status].className} variant={status === "unpaid" ? "secondary" : "default"}>
                                {STATUS_META[status].label}
                            </Badge>
                            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                            {bill?.series_id && (
                                <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/bills/series/${bill.series_id}`)}>
                                    <Repeat className="size-3.5" />Recurring — Manage Series
                                </Button>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                            Paid {CURRENCIES.find((c) => c.code === bill?.currency_code)?.symbol ?? bill?.currency_code} {paidAmount.toFixed(2)}
                            {" "}of {CURRENCIES.find((c) => c.code === bill?.currency_code)?.symbol ?? bill?.currency_code} {billAmount.toFixed(2)}
                        </p>

                        <Form {...form}>
                            <form className="w-full flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Bill Name" {...field} />
                                            </FormControl>
                                            <FormDescription />
                                            <FormMessage>{errors.name?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <Label>Amount</Label>
                                    <div className="flex gap-2 mt-2">
                                        <FormField
                                            control={form.control}
                                            name="currency_code"
                                            render={({ field }) => (
                                                <FormItem className="w-24 shrink-0">
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Currency">
                                                                    {CURRENCIES.find((c) => c.code === field.value)?.symbol ?? field.value}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {CURRENCIES.map((currency) => (
                                                                <SelectItem key={currency.code} value={currency.code}>
                                                                    {currency.symbol} {currency.code}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage>{errors.currency_code?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{errors.amount?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Category</FormLabel>
                                                <Combobox
                                                    options={categoryOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select a category (optional)"
                                                    searchPlaceholder="Search categories"
                                                    emptyText="No category found"
                                                />
                                                <FormDescription />
                                                <FormMessage>{errors.category_id?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="account_id"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Expected Payment Account</FormLabel>
                                                <Combobox
                                                    options={accountOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select an account (optional)"
                                                    searchPlaceholder="Search accounts"
                                                    emptyText="No account found"
                                                />
                                                <FormDescription />
                                                <FormMessage>{errors.account_id?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bill_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bill Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className="w-full sm:w-64 justify-start font-normal">
                                                                <CalendarIcon />
                                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            defaultMonth={field.value}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {bill?.series_id && (
                                                    <FormDescription>
                                                        Only changes this occurrence — future ones still follow the series.
                                                    </FormDescription>
                                                )}
                                                <FormMessage>{errors.bill_date?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="due_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Due Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className="w-full sm:w-64 justify-start font-normal">
                                                                <CalendarIcon />
                                                                {field.value ? format(field.value, "PPP") : <span>Same as bill date</span>}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ?? undefined}
                                                            onSelect={field.onChange}
                                                            defaultMonth={field.value ?? form.getValues("bill_date")}
                                                            initialFocus
                                                        />
                                                        <div className="p-2 border-t flex justify-end">
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange(null)}>Clear</Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormDescription>Optional — defaults to the bill date.</FormDescription>
                                                <FormMessage>{errors.due_date?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 w-full max-w-xs">
                                    <Button type="submit" disabled={isSubmitting}>Save</Button>
                                    <Button type="button" onClick={onBack}>Back</Button>
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </Card>

            {owned && (
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Payments</CardTitle>
                </CardHeader>
                <div className="w-full flex flex-col gap-4">
                    <div className="overflow-x-auto w-full">
                        {payments.loading ? (
                            <LoadingState className="py-4" />
                        ) : payments.items.length === 0 ? (
                            <div className="h-16 flex text-center items-center justify-center w-full">
                                <h2 className="text-sm text-muted-foreground">No Payments Recorded Yet</h2>
                            </div>
                        ) : (
                            <Table className="min-w-full">
                                <TableCaption>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={payments.previousPage}
                                                    className={payments.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink className="font-bold text-primary cursor-default">
                                                    {payments.page} / {payments.totalPages}
                                                </PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={payments.nextPage}
                                                    className={payments.page >= payments.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Date</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Amount</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Notes</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.items.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="text-sm">{format(parse(p.paid_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")}</TableCell>
                                            <TableCell className="text-sm">{parseFloat(p.amount_paid).toFixed(2)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{p.notes || "—"}</TableCell>
                                            <TableCell className="flex justify-center">
                                                <Alert
                                                    button_text={<Trash2 />}
                                                    title="Remove Payment"
                                                    description="This removes the payment record. The bill's paid status will be recalculated."
                                                    action={() => handleDeletePayment(p.id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <Form {...paymentForm}>
                        <form
                            className="flex flex-wrap items-end gap-2"
                            onSubmit={paymentForm.handleSubmit(onRecordPayment)}
                        >
                            <FormField
                                control={paymentForm.control}
                                name="amount_paid"
                                render={({ field }) => (
                                    <FormItem className="w-36">
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder={billAmount.toFixed(2)} {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={paymentForm.control}
                                name="paid_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paid Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("w-40 justify-start font-normal")}>
                                                        <CalendarIcon />
                                                        {field.value ? format(field.value, "d MMM yyyy") : <span>Pick a date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    defaultMonth={field.value}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={paymentForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="flex-1 min-w-[10rem]">
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={paymentForm.formState.isSubmitting}>Record Payment</Button>
                        </form>
                    </Form>
                    <p className="text-xs text-muted-foreground">
                        Leave Amount blank to record a full payment of {billAmount.toFixed(2)}.
                    </p>
                </div>
            </Card>
            )}

            {owned && (
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Budgets</CardTitle>
                </CardHeader>
                <LinkedItemsSection
                    title="Shared With Budgets"
                    linkedItems={linkedBudgets}
                    linkedLoading={linkedBudgetsLoading}
                    options={budgetOptions}
                    comboboxPlaceholder="Select a budget to share this bill with"
                    renderItemLabel={(budget) => budget.name}
                    onLink={async (budgetId) => {
                        try {
                            await linkBillBudget(bill_id!, budgetId)
                            fetchLinkedBudgets()
                        } catch (error) {
                            toast.error((error as Error).message)
                        }
                    }}
                    onUnlink={async (budget) => {
                        try {
                            await unlinkBillBudget(bill_id!, budget.id)
                            fetchLinkedBudgets()
                        } catch (error) {
                            toast.error((error as Error).message)
                        }
                    }}
                />
                <p className="text-xs text-muted-foreground">
                    Members of a shared budget will see this bill (and its payments) in their own Bills list — attachments stay visible to you only.
                    {bill?.series_id && " Since this is a recurring bill, linking or unlinking here applies to every occurrence in the series — past and future — not just this one."}
                </p>
            </Card>
            )}

            {owned && (
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <LinkedItemsSection
                    title="Linked Attachments"
                    linkedItems={linkedAttachments}
                    linkedLoading={linkedAttachmentsLoading}
                    options={attachmentOptions}
                    comboboxPlaceholder="Select an attachment to link"
                    renderItemLabel={(attachment) => attachment.filename}
                    renderItemExtra={(attachment) => (
                        <button type="button" title="Download" onClick={() => handleOpenAttachment(attachment.id)}>
                            <Download className="size-3" />
                        </button>
                    )}
                    onLink={async (attachmentId) => {
                        try {
                            await linkBillAttachment(bill_id!, attachmentId)
                            fetchLinkedAttachments()
                        } catch (error) {
                            toast.error((error as Error).message)
                        }
                    }}
                    onUnlink={async (attachment) => {
                        try {
                            await unlinkBillAttachment(bill_id!, attachment.id)
                            fetchLinkedAttachments()
                        } catch (error) {
                            toast.error((error as Error).message)
                        }
                    }}
                />
            </Card>
            )}
        </div>
    )
}

export default BillEditPage
