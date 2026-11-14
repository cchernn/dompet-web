import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CalendarIcon, Repeat, Download, Trash2 } from "lucide-react"
import { format, parse } from "date-fns"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/loading-state"
import { Badge } from "@/components/ui/badge"
import { LinkedItemsSection } from "@/components/linked-items-section"
import Alert from "@/lib/alertDialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { useCurrentUserId, isOwnedBy } from "@/hooks/use-current-user-id"
import { getStatement, updateStatement, deleteStatement } from "@/api/statements"
import { listStatementAttachments, linkStatementAttachment, unlinkStatementAttachment } from "@/api/statementAttachments"
import { listAttachments, getAttachment } from "@/api/attachments"
import { searchAccounts } from "@/api/accounts"
import { CURRENCIES } from "@/lib/currencies"
import type { Attachment, Statement, StatementPatch, StatementStatus } from "@/api/types"

const formSchema = z.object({
    currency_code: z.string().nullable().optional(),
    statement_date: z.date({ required_error: "Statement date is required" }),
    period_start: z.date({ required_error: "Period start is required" }),
    period_end: z.date({ required_error: "Period end is required" }),
    received_date: z.date().nullable().optional(),
    opening_balance: z.string().optional(),
    closing_balance: z.string().optional(),
    notes: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.period_end < data.period_start) {
        ctx.addIssue({ path: ["period_end"], code: z.ZodIssueCode.custom, message: "Period end must not be before period start" })
    }
    const hasBalance = Boolean(data.opening_balance?.trim() || data.closing_balance?.trim())
    if (hasBalance && !data.currency_code) {
        ctx.addIssue({ path: ["currency_code"], code: z.ZodIssueCode.custom, message: "Currency is required when a balance is given" })
    }
})

const STATUS_META: Record<StatementStatus, { label: string; className: string }> = {
    pending: { label: "Pending", className: "" },
    received: { label: "Received", className: "bg-green-600 text-white border-green-600" },
    overdue: { label: "Overdue", className: "" },
}

function StatementEditPage() {
    const { statement_id } = useParams<{ statement_id: string }>()
    const navigate = useNavigate()

    const [statement, setStatement] = useState<Statement | null>(null)
    const currentUserId = useCurrentUserId()
    const owned = isOwnedBy(statement?.user_id, currentUserId)
    const [loading, setLoading] = useState(true)

    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: 1000 }))
    const { data: attachmentsData } = useCachedResource("attachments:list", () => listAttachments({ pageSize: 100 }))
    const attachmentOptions = (attachmentsData ?? []).map((a) => ({ value: a.id, label: a.name }))
    const accountName = accountsData?.find((a) => a.id === statement?.account_id)?.name ?? statement?.account_id

    const [linkedAttachments, setLinkedAttachments] = useState<Attachment[]>([])
    const [linkedAttachmentsLoading, setLinkedAttachmentsLoading] = useState(true)

    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) })
    const { formState: { errors, isSubmitting } } = form

    const status: StatementStatus = statement
        ? statement.received_date
            ? "received"
            : parse(statement.statement_date, "yyyy-MM-dd", new Date()) < new Date(new Date().toDateString())
                ? "overdue"
                : "pending"
        : "pending"

    const fetchStatement = async () => {
        try {
            const { data } = await getStatement(statement_id!)
            setStatement(data)
            form.reset({
                currency_code: data.currency_code ?? null,
                statement_date: parse(data.statement_date, "yyyy-MM-dd", new Date()),
                period_start: parse(data.period_start, "yyyy-MM-dd", new Date()),
                period_end: parse(data.period_end, "yyyy-MM-dd", new Date()),
                received_date: data.received_date ? parse(data.received_date, "yyyy-MM-dd", new Date()) : null,
                opening_balance: data.opening_balance ?? "",
                closing_balance: data.closing_balance ?? "",
                notes: data.notes ?? "",
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
            const { data } = await listStatementAttachments(statement_id!, { pageSize: 100 })
            setLinkedAttachments(data)
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setLinkedAttachmentsLoading(false)
        }
    }

    useEffect(() => {
        fetchStatement()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statement_id])

    useEffect(() => {
        if (!owned) return
        fetchLinkedAttachments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [owned])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const patch: StatementPatch = {
                statement_date: format(data.statement_date, "yyyy-MM-dd"),
                period_start: format(data.period_start, "yyyy-MM-dd"),
                period_end: format(data.period_end, "yyyy-MM-dd"),
                received_date: data.received_date ? format(data.received_date, "yyyy-MM-dd") : undefined,
                opening_balance: data.opening_balance?.trim() ? parseFloat(data.opening_balance) : undefined,
                closing_balance: data.closing_balance?.trim() ? parseFloat(data.closing_balance) : undefined,
                currency_code: data.currency_code || undefined,
                notes: data.notes?.trim() || undefined,
            }
            const { data: updated } = await updateStatement(statement_id!, patch)
            setStatement(updated)
            toast.success("Statement updated")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleMarkReceived = async () => {
        try {
            const { data: updated } = await updateStatement(statement_id!, { received_date: format(new Date(), "yyyy-MM-dd") })
            setStatement(updated)
            form.setValue("received_date", parse(updated.received_date!, "yyyy-MM-dd", new Date()))
            toast.success("Marked as received")
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
            await deleteStatement(statement_id!)
            toast.success("Statement deleted")
            navigate("/statements")
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
                        <CardTitle>Statement ID: {statement_id}</CardTitle>
                        {statement && owned && (
                            <Alert
                                button_text={<><Trash2 />Delete</>}
                                title="Delete Statement"
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
                        This statement belongs to another user, so it can&apos;t be edited here.
                    </p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant={statement?.is_active ? "secondary" : "outline"}>
                                {statement?.is_active ? "Active" : "Deleted"}
                            </Badge>
                            <Badge className={STATUS_META[status].className} variant={status === "received" ? "default" : "secondary"}>
                                {STATUS_META[status].label}
                            </Badge>
                            {statement?.series_id && (
                                <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/statements/series/${statement.series_id}`)}>
                                    <Repeat className="size-3.5" />Recurring — Manage Series
                                </Button>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">Account: {accountName}</p>

                        <Form {...form}>
                            <form className="w-full flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="currency_code"
                                    render={({ field }) => (
                                        <FormItem className="w-40">
                                            <FormLabel>Currency</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="No currency" />
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

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="statement_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Statement Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className="w-full sm:w-56 justify-start font-normal">
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
                                                {statement?.series_id && (
                                                    <FormDescription>
                                                        Only changes this occurrence — future ones still follow the series.
                                                    </FormDescription>
                                                )}
                                                <FormMessage>{errors.statement_date?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="received_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Received Date</FormLabel>
                                                <div className="flex gap-2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button variant="outline" className="w-full sm:w-44 justify-start font-normal">
                                                                    <CalendarIcon />
                                                                    {field.value ? format(field.value, "PPP") : <span>Not yet</span>}
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value ?? undefined}
                                                                onSelect={field.onChange}
                                                                defaultMonth={field.value ?? new Date()}
                                                                initialFocus
                                                            />
                                                            <div className="p-2 border-t flex justify-end">
                                                                <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange(null)}>Clear</Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                    {!field.value && (
                                                        <Button type="button" variant="outline" onClick={handleMarkReceived}>Today</Button>
                                                    )}
                                                </div>
                                                <FormMessage>{errors.received_date?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="period_start"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Period Start</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className="w-full sm:w-56 justify-start font-normal">
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
                                                <FormMessage>{errors.period_start?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="period_end"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Period End</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className="w-full sm:w-56 justify-start font-normal">
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
                                                <FormMessage>{errors.period_end?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="opening_balance"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Opening Balance</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="Optional" {...field} />
                                                </FormControl>
                                                <FormMessage>{errors.opening_balance?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="closing_balance"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Closing Balance</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="Optional" {...field} />
                                                </FormControl>
                                                <FormMessage>{errors.closing_balance?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormMessage>{errors.notes?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

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
                    <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <LinkedItemsSection
                    title="Linked Attachments"
                    linkedItems={linkedAttachments}
                    linkedLoading={linkedAttachmentsLoading}
                    options={attachmentOptions}
                    comboboxPlaceholder="Select an attachment to link"
                    renderItemLabel={(attachment) => attachment.name}
                    renderItemExtra={(attachment) => (
                        <button type="button" title="Download" onClick={() => handleOpenAttachment(attachment.id)}>
                            <Download className="size-3" />
                        </button>
                    )}
                    onLink={async (attachmentId) => {
                        try {
                            await linkStatementAttachment(statement_id!, attachmentId)
                            fetchLinkedAttachments()
                        } catch (error) {
                            toast.error((error as Error).message)
                        }
                    }}
                    onUnlink={async (attachment) => {
                        try {
                            await unlinkStatementAttachment(statement_id!, attachment.id)
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

export default StatementEditPage
