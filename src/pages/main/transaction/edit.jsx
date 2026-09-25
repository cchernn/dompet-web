import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CalendarIcon, Ban, RotateCcw, X, Download } from "lucide-react"
import { toast } from "sonner"
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
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import Alert from "@/lib/alertDialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getTransaction, updateTransaction, deactivateTransaction, reactivateTransaction } from "@/api/transactions"
import { listAccounts } from "@/api/accounts"
import { listCategories } from "@/api/categories"
import { listTags } from "@/api/tags"
import { listTransactionTags, linkTag, unlinkTag } from "@/api/transactionTags"
import { listAttachments, getAttachment } from "@/api/attachments"
import { listTransactionAttachments, linkAttachment, unlinkAttachment } from "@/api/transactionAttachments"
import { listBudgets } from "@/api/budgets"
import { listTransactionBudgets, linkBudget, unlinkBudget } from "@/api/transactionBudgets"
import { CURRENCIES } from "@/lib/currencies"

const formSchema = z.object({
    date: z.date({ required_error: "Date is required" }),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "Use HH:MM (24-hour)" }),
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be less than 255 characters" }),
    type: z.enum(["expenditure", "income", "transfer"]),
    amount: z.coerce.number()
        .min(0, { message: "Amount must be zero or greater" })
        .transform((val) => parseFloat(val.toFixed(2))),
    currency_code: z.string().length(3, { message: "Select a currency" }),
    category_id: z.string().nullable().optional(),
    source_account_id: z.string({ required_error: "Source account is required" }),
    destination_account_id: z.string({ required_error: "Destination account is required" }),
})

// Small reusable "linked items" section: a badge list with Unlink buttons,
// plus a Combobox + Link button to attach another item. Used for the Tags,
// Attachments and Budgets sub-sections below.
function LinkedItemsSection({ title, linkedItems, linkedLoading, options, comboboxPlaceholder, onLink, onUnlink, renderItemLabel, renderItemExtra }) {
    const [selected, setSelected] = useState(null)
    const excludeValues = linkedItems.map((item) => item.id)

    return (
        <div className="flex flex-col gap-2 w-full">
            <h3 className="font-semibold text-sm">{title}</h3>
            {linkedLoading ? (
                <Skeleton className="h-6 w-full" />
            ) : linkedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">None linked yet.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {linkedItems.map((item) => (
                        <Badge key={item.id} variant="secondary" className="gap-2 pr-1 items-center">
                            {renderItemLabel(item)}
                            {renderItemExtra?.(item)}
                            <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => onUnlink(item)}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            <div className="flex gap-2 items-center max-w-md">
                <Combobox
                    options={options}
                    value={selected}
                    onChange={setSelected}
                    excludeValues={excludeValues}
                    placeholder={comboboxPlaceholder}
                />
                <Button
                    type="button"
                    variant="outline"
                    disabled={!selected}
                    onClick={() => {
                        onLink(selected)
                        setSelected(null)
                    }}
                >
                    Link
                </Button>
            </div>
        </div>
    )
}

function TransactionEditPage() {
    const { transaction_id } = useParams()
    const navigate = useNavigate()

    const [transaction, setTransaction] = useState(null)
    const [loading, setLoading] = useState(true)

    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState([])

    const [tagOptions, setTagOptions] = useState([])
    const [attachmentOptions, setAttachmentOptions] = useState([])
    const [budgetOptions, setBudgetOptions] = useState([])

    const [linkedTags, setLinkedTags] = useState([])
    const [linkedTagsLoading, setLinkedTagsLoading] = useState(true)
    const [linkedAttachments, setLinkedAttachments] = useState([])
    const [linkedAttachmentsLoading, setLinkedAttachmentsLoading] = useState(true)
    const [linkedBudgets, setLinkedBudgets] = useState([])
    const [linkedBudgetsLoading, setLinkedBudgetsLoading] = useState(true)

    const form = useForm({ resolver: zodResolver(formSchema) })
    const {
        formState: { errors, isSubmitting },
    } = form

    const fetchTransaction = async () => {
        try {
            const { data } = await getTransaction(transaction_id)
            setTransaction(data)
            const dt = new Date(data.datetime)
            form.reset({
                date: dt,
                time: dt.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Kuala_Lumpur",
                }),
                name: data.name ?? "",
                type: data.type,
                amount: parseFloat(data.amount),
                currency_code: data.currency_code,
                category_id: data.category_id ?? null,
                source_account_id: data.source_account_id,
                destination_account_id: data.destination_account_id,
            })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchLinkedTags = async () => {
        setLinkedTagsLoading(true)
        try {
            const { data } = await listTransactionTags(transaction_id, { pageSize: 100 })
            setLinkedTags(data)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLinkedTagsLoading(false)
        }
    }

    const fetchLinkedAttachments = async () => {
        setLinkedAttachmentsLoading(true)
        try {
            const { data } = await listTransactionAttachments(transaction_id, { pageSize: 100 })
            setLinkedAttachments(data)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLinkedAttachmentsLoading(false)
        }
    }

    const fetchLinkedBudgets = async () => {
        setLinkedBudgetsLoading(true)
        try {
            const { data } = await listTransactionBudgets(transaction_id, { pageSize: 100 })
            setLinkedBudgets(data)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLinkedBudgetsLoading(false)
        }
    }

    useEffect(() => {
        fetchTransaction()
        fetchLinkedTags()
        fetchLinkedAttachments()
        fetchLinkedBudgets()

        listAccounts({ pageSize: 100 }).then(({ data }) => setAccounts(data)).catch((error) => toast.error(error.message))
        listCategories({ pageSize: 100 }).then(({ data }) => setCategories(data)).catch((error) => toast.error(error.message))
        listTags({ pageSize: 100 }).then(({ data }) => setTagOptions(data.map((t) => ({ value: t.id, label: t.name })))).catch((error) => toast.error(error.message))
        listAttachments({ pageSize: 100 }).then(({ data }) => setAttachmentOptions(data.map((a) => ({ value: a.id, label: a.filename })))).catch((error) => toast.error(error.message))
        listBudgets({ pageSize: 100 }).then(({ data }) => setBudgetOptions(data.map((b) => ({ value: b.id, label: b.name })))).catch((error) => toast.error(error.message))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transaction_id])

    const accountOptions = accounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }))
    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

    const onSubmit = async (data) => {
        try {
            const datePart = data.date.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" })
            const patch = {
                datetime: `${datePart}T${data.time}:00`,
                type: data.type,
                amount: data.amount,
                currency_code: data.currency_code,
                category_id: data.category_id || null,
                source_account_id: data.source_account_id,
                destination_account_id: data.destination_account_id,
            }
            // Never send a blank name — omit it rather than trust the backend to reject it.
            if (data.name && data.name.trim() !== "") {
                patch.name = data.name.trim()
            }
            await updateTransaction(transaction_id, patch)
            toast.success("Transaction updated")
            navigate("/transactions")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onBack = () => navigate(-1)

    const handleOpenAttachment = async (attachmentId) => {
        // Linked-attachment listings no longer carry a download_url (listing
        // many attachments shouldn't pay for an S3 presigned-URL generation
        // per row) — fetch one on demand for the attachment being opened.
        const newTab = window.open("", "_blank")
        try {
            const { data } = await getAttachment(attachmentId)
            if (newTab) newTab.location.href = data.download_url
        } catch (error) {
            if (newTab) newTab.close()
            toast.error(error.message)
        }
    }

    const handleToggleActive = async () => {
        try {
            if (transaction.is_active) {
                await deactivateTransaction(transaction_id)
                toast.success("Transaction deactivated")
            } else {
                await reactivateTransaction(transaction_id)
                toast.success("Transaction reactivated")
            }
            fetchTransaction()
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4 w-full">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle>Transaction ID: {transaction_id}</CardTitle>
                        {transaction && (
                            <div className="flex items-center gap-2">
                                <Badge variant={transaction.is_active ? "secondary" : "outline"}>
                                    {transaction.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Alert
                                    button_text={transaction.is_active ? <><Ban />Deactivate</> : <><RotateCcw />Reactivate</>}
                                    title={transaction.is_active ? "Deactivate Transaction" : "Reactivate Transaction"}
                                    description={
                                        transaction.is_active
                                            ? "This will mark the transaction inactive. It can be reactivated later."
                                            : "This will restore the transaction to active status."
                                    }
                                    action={handleToggleActive}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled
                                    title="Rollback requires picking a prior operation, but no endpoint yet exists to list a transaction's operation history."
                                >
                                    Rollback
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                {loading ? (
                    <div className="w-full">
                        <Skeleton className="h-6 w-full my-2" />
                        <Skeleton className="h-6 w-full my-2" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                            {/* Date Field */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline">
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    defaultMonth={field.value}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription />
                                        <FormMessage>{errors.date?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Time Field */}
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" className="w-40" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.time?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Transaction Name" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.name?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Type Field */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a transaction type." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="expenditure">Expenditure</SelectItem>
                                                <SelectItem value="income">Income</SelectItem>
                                                <SelectItem value="transfer">Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription />
                                        <FormMessage>{errors.type?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Amount Field */}
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="Amount" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.amount?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Currency Field */}
                            <FormField
                                control={form.control}
                                name="currency_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a currency." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CURRENCIES.map((currency) => (
                                                    <SelectItem key={currency.code} value={currency.code}>
                                                        {currency.code} — {currency.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription />
                                        <FormMessage>{errors.currency_code?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Category Field */}
                            <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
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

                            {/* Source Account Field */}
                            <FormField
                                control={form.control}
                                name="source_account_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source Account</FormLabel>
                                        <Combobox
                                            options={accountOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select the source account"
                                            searchPlaceholder="Search accounts"
                                            emptyText="No account found"
                                        />
                                        <FormDescription>Account the money/activity originates from.</FormDescription>
                                        <FormMessage>{errors.source_account_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Destination Account Field */}
                            <FormField
                                control={form.control}
                                name="destination_account_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination Account</FormLabel>
                                        <Combobox
                                            options={accountOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select the destination account"
                                            searchPlaceholder="Search accounts"
                                            emptyText="No account found"
                                        />
                                        <FormDescription>Account the money/activity goes to.</FormDescription>
                                        <FormMessage>{errors.destination_account_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-2 w-full max-w-xs">
                                <Button type="submit" disabled={isSubmitting}>Submit</Button>
                                <Button type="button" onClick={onBack}>Back</Button>
                            </div>
                        </form>
                    </Form>
                )}

                {!loading && (
                    <div className="w-full max-w-screen-md flex flex-col gap-8 mt-8 pt-8 border-t">
                        <LinkedItemsSection
                            title="Tags"
                            linkedItems={linkedTags}
                            linkedLoading={linkedTagsLoading}
                            options={tagOptions}
                            comboboxPlaceholder="Select a tag to link"
                            renderItemLabel={(tag) => tag.name}
                            onLink={async (tagId) => {
                                try {
                                    await linkTag(transaction_id, tagId)
                                    fetchLinkedTags()
                                } catch (error) {
                                    toast.error(error.message)
                                }
                            }}
                            onUnlink={async (tag) => {
                                try {
                                    await unlinkTag(transaction_id, tag.id)
                                    fetchLinkedTags()
                                } catch (error) {
                                    toast.error(error.message)
                                }
                            }}
                        />

                        <LinkedItemsSection
                            title="Attachments"
                            linkedItems={linkedAttachments}
                            linkedLoading={linkedAttachmentsLoading}
                            options={attachmentOptions}
                            comboboxPlaceholder="Select an attachment to link"
                            renderItemLabel={(attachment) => attachment.filename}
                            renderItemExtra={(attachment) => (
                                <button
                                    type="button"
                                    title="Download"
                                    onClick={() => handleOpenAttachment(attachment.id)}
                                >
                                    <Download className="size-3" />
                                </button>
                            )}
                            onLink={async (attachmentId) => {
                                try {
                                    await linkAttachment(transaction_id, attachmentId)
                                    fetchLinkedAttachments()
                                } catch (error) {
                                    toast.error(error.message)
                                }
                            }}
                            onUnlink={async (attachment) => {
                                try {
                                    await unlinkAttachment(transaction_id, attachment.id)
                                    fetchLinkedAttachments()
                                } catch (error) {
                                    toast.error(error.message)
                                }
                            }}
                        />

                        <LinkedItemsSection
                            title="Budgets"
                            linkedItems={linkedBudgets}
                            linkedLoading={linkedBudgetsLoading}
                            options={budgetOptions}
                            comboboxPlaceholder="Select a budget to link"
                            renderItemLabel={(budget) => budget.name}
                            onLink={async (budgetId) => {
                                try {
                                    await linkBudget(transaction_id, budgetId)
                                    fetchLinkedBudgets()
                                } catch (error) {
                                    toast.error(error.message)
                                }
                            }}
                            onUnlink={async (budget) => {
                                try {
                                    await unlinkBudget(transaction_id, budget.id)
                                    fetchLinkedBudgets()
                                } catch (error) {
                                    toast.error(error.message)
                                }
                            }}
                        />
                    </div>
                )}
            </Card>
        </div>
    )
}

export default TransactionEditPage
