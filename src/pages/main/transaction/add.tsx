import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon, ArrowRight } from "lucide-react"
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
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { LinkedItemsSection } from "@/components/linked-items-section"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { AmountDisplay, AMOUNT_META } from "@/components/amount-display"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { createTransaction } from "@/api/transactions"
import { searchAccounts } from "@/api/accounts"
import { searchCategories } from "@/api/categories"
import { listTags } from "@/api/tags"
import { linkTag } from "@/api/transactionTags"
import { listAttachments } from "@/api/attachments"
import { linkAttachment } from "@/api/transactionAttachments"
import { listBudgets } from "@/api/budgets"
import { linkBudget } from "@/api/transactionBudgets"
import { listAccountLocations } from "@/api/accountLocations"
import { CURRENCIES } from "@/lib/currencies"
import type { Tag, Attachment, Budget, TransactionType } from "@/api/types"

// Filter-dropdown source: up to 1000 rows in one call (vs. the plain list
// endpoints' 100-row cap), same as the transactions-list filter.
const ACCOUNT_CATEGORY_PAGE_SIZE = 1000

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
    source_location_id: z.string().nullable().optional(),
    destination_location_id: z.string().nullable().optional(),
})

const TYPE_LABELS: Record<TransactionType, string> = {
    expenditure: "Expenditure",
    income: "Income",
    transfer: "Transfer",
}

const TYPE_ACTIVE_CLASSES: Record<TransactionType, string> = {
    expenditure: "bg-red-600 text-white border-red-600 hover:bg-red-600",
    income: "bg-green-600 text-white border-green-600 hover:bg-green-600",
    transfer: "bg-blue-600 text-white border-blue-600 hover:bg-blue-600",
}

function TransactionAddPage() {
    const navigate = useNavigate()
    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const { data: categoriesData } = useCachedResource("categories:search", () => searchCategories({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const { data: tagsData } = useCachedResource("tags:list", () => listTags({ pageSize: 100 }))
    const { data: attachmentsData } = useCachedResource("attachments:list", () => listAttachments({ pageSize: 100 }))
    const { data: budgetsData } = useCachedResource("budgets:list", () => listBudgets({ pageSize: 100 }))
    const accounts = accountsData ?? []
    const categories = categoriesData ?? []
    const tags = tagsData ?? []
    const attachments = attachmentsData ?? []
    const budgets = budgetsData ?? []

    // The transaction doesn't exist yet, so these can't be linked via the
    // real POST /transactions/{id}/tags-style endpoints until after create —
    // held here as pending selections and linked in a follow-up pass in
    // onSubmit once we have a real transaction id.
    const [pendingTags, setPendingTags] = useState<Tag[]>([])
    const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
    const [pendingBudgets, setPendingBudgets] = useState<Budget[]>([])
    const [sourceLocationOptions, setSourceLocationOptions] = useState<ComboboxOption[]>([])
    const [destinationLocationOptions, setDestinationLocationOptions] = useState<ComboboxOption[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            time: "00:00",
            name: "",
            type: "expenditure",
            amount: 0,
            currency_code: "MYR",
            category_id: null,
            source_location_id: null,
            destination_location_id: null,
        },
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    // Live preview only — react-hook-form's watch, not a source of truth.
    const previewType = form.watch("type")
    const previewAmount = form.watch("amount")
    const previewCurrency = form.watch("currency_code")
    const sourceAccountId = form.watch("source_account_id")
    const destinationAccountId = form.watch("destination_account_id")

    // Each leg's location must already be linked (via account_locations) to
    // that same leg's account — independently, not a shared/merged list —
    // so each side gets its own option fetch, scoped to its own account and
    // refetched whenever that account changes. A previously-picked location
    // is cleared if it falls outside the new set, but only on an actual
    // account change (skipped on the very first run) so this can't wipe out
    // a value the moment the effect first mounts.
    const previousSourceAccountIdRef = useRef<string | undefined>(undefined)
    useEffect(() => {
        if (!sourceAccountId) {
            setSourceLocationOptions([])
            return
        }
        let cancelled = false
        listAccountLocations(sourceAccountId, { pageSize: 100 }).then(({ data }) => {
            if (cancelled) return
            const options = data.map((location) => ({ value: location.id, label: location.name }))
            setSourceLocationOptions(options)

            const previous = previousSourceAccountIdRef.current
            if (previous !== undefined && previous !== sourceAccountId) {
                const currentValue = form.getValues("source_location_id")
                if (currentValue && !options.some((option) => option.value === currentValue)) {
                    form.setValue("source_location_id", null)
                }
            }
            previousSourceAccountIdRef.current = sourceAccountId
        }).catch((error: Error) => toast.error(error.message))
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceAccountId])

    const previousDestinationAccountIdRef = useRef<string | undefined>(undefined)
    useEffect(() => {
        if (!destinationAccountId) {
            setDestinationLocationOptions([])
            return
        }
        let cancelled = false
        listAccountLocations(destinationAccountId, { pageSize: 100 }).then(({ data }) => {
            if (cancelled) return
            const options = data.map((location) => ({ value: location.id, label: location.name }))
            setDestinationLocationOptions(options)

            const previous = previousDestinationAccountIdRef.current
            if (previous !== undefined && previous !== destinationAccountId) {
                const currentValue = form.getValues("destination_location_id")
                if (currentValue && !options.some((option) => option.value === currentValue)) {
                    form.setValue("destination_location_id", null)
                }
            }
            previousDestinationAccountIdRef.current = destinationAccountId
        }).catch((error: Error) => toast.error(error.message))
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinationAccountId])

    const accountOptions: ComboboxOption[] = accounts.map((a) => ({ value: a.id, label: a.name }))
    const categoryOptions: ComboboxOption[] = categories.map((c) => ({ value: c.id, label: c.name }))
    const tagOptions: ComboboxOption[] = tags.map((t) => ({ value: t.id, label: t.name }))
    const attachmentOptions: ComboboxOption[] = attachments.map((a) => ({ value: a.id, label: a.filename }))
    const budgetOptions: ComboboxOption[] = budgets.map((b) => ({ value: b.id, label: b.name }))

    const addPending = <T extends { id: string }>(setter: Dispatch<SetStateAction<T[]>>, source: T[]) => (id: string) => {
        const item = source.find((entry) => entry.id === id)
        if (item) setter((prev) => [...prev, item])
    }
    const removePending = <T extends { id: string }>(setter: Dispatch<SetStateAction<T[]>>) => (item: T) => setter((prev) => prev.filter((entry) => entry.id !== item.id))

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const datePart = data.date.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" })
            const { data: created } = await createTransaction({
                // Explicit +08:00 offset required — Asia/Kuala_Lumpur has no
                // DST, so this is always correct, and the backend now hard-
                // rejects a naive datetime (see app/db/transaction_operation.py
                // in dompet — a naive value was silently misread as UTC,
                // which is what corrupted the Firefly-migrated rows and 8
                // real user-created transactions before being fixed).
                datetime: `${datePart}T${data.time}:00+08:00`,
                name: data.name,
                type: data.type,
                amount: data.amount,
                currency_code: data.currency_code,
                category_id: data.category_id || undefined,
                source_account_id: data.source_account_id,
                destination_account_id: data.destination_account_id,
                source_location_id: data.source_location_id || undefined,
                destination_location_id: data.destination_location_id || undefined,
            })

            // The transaction now exists, so pending tag/attachment/budget
            // selections can actually be linked. A failure here shouldn't
            // block navigation — the transaction itself was created fine —
            // so each link is caught individually and reported. Any failed
            // link must be retried from the transaction's own edit page
            // (reachable from the list), not automatically here.
            let linkFailures = 0
            for (const tag of pendingTags) {
                try {
                    await linkTag(created.id, tag.id)
                } catch (error) {
                    linkFailures += 1
                    toast.error(`Couldn't link tag "${tag.name}": ${(error as Error).message}`)
                }
            }
            for (const attachment of pendingAttachments) {
                try {
                    await linkAttachment(created.id, attachment.id)
                } catch (error) {
                    linkFailures += 1
                    toast.error(`Couldn't link attachment "${attachment.filename}": ${(error as Error).message}`)
                }
            }
            for (const budget of pendingBudgets) {
                try {
                    await linkBudget(created.id, budget.id)
                } catch (error) {
                    linkFailures += 1
                    toast.error(`Couldn't link budget "${budget.name}": ${(error as Error).message}`)
                }
            }

            toast.success(linkFailures > 0 ? "Transaction created (some links failed)" : "Transaction created")
            navigate("/transactions")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>New Transaction</CardTitle>
                </CardHeader>
                <Form {...form}>
                    <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                        {/* Live amount preview */}
                        <div className="flex justify-center py-2">
                            <AmountDisplay
                                transaction={{ type: previewType, amount: previewAmount, currency: previewCurrency }}
                                className="text-3xl"
                            />
                        </div>

                        {/* Type Field — icon toggle group instead of a plain dropdown */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.entries(TYPE_LABELS) as [TransactionType, string][]).map(([value, label]) => {
                                            const { Icon } = AMOUNT_META[value]
                                            const active = field.value === value
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => field.onChange(value)}
                                                    className={cn(
                                                        "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                                                        active ? TYPE_ACTIVE_CLASSES[value] : "hover:bg-muted"
                                                    )}
                                                >
                                                    <Icon className="size-3.5" />
                                                    {label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <FormDescription>
                                        Purely descriptive — both accounts below are always your own accounts, there is no separate external/system account.
                                    </FormDescription>
                                    <FormMessage>{errors.type?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Amount + Currency — one compound control */}
                        <div>
                            <Label>Amount</Label>
                            <div className="flex gap-2 mt-2">
                                <FormField
                                    control={form.control}
                                    name="currency_code"
                                    render={({ field }) => (
                                        <FormItem className="w-24 shrink-0">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        {/* Explicit children override Radix's default (which mirrors
                                                            the selected SelectItem's full label) so the trigger stays
                                                            compact — the dropdown list still shows symbol + code. */}
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

                        {/* Date + Time — stack on mobile, side by side from sm: up */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className="w-full justify-start font-normal">
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

                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem className="sm:w-40">
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.time?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

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

                        {/* Source → Destination, each paired with its own Location — stack on mobile, side by side from sm: up */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 min-w-0 flex flex-col gap-4">
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

                                <FormField
                                    control={form.control}
                                    name="source_location_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Source Location</FormLabel>
                                            <Combobox
                                                options={sourceLocationOptions}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="No location (optional)"
                                                searchPlaceholder="Search locations"
                                                emptyText={sourceAccountId ? "No locations linked to this account" : "Select an account first"}
                                            />
                                            <FormDescription>Must be linked to this account.</FormDescription>
                                            <FormMessage>{errors.source_location_id?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <ArrowRight className="size-4 text-muted-foreground shrink-0 self-center rotate-90 sm:rotate-0" />

                            <div className="flex-1 min-w-0 flex flex-col gap-4">
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

                                <FormField
                                    control={form.control}
                                    name="destination_location_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Destination Location</FormLabel>
                                            <Combobox
                                                options={destinationLocationOptions}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="No location (optional)"
                                                searchPlaceholder="Search locations"
                                                emptyText={destinationAccountId ? "No locations linked to this account" : "Select an account first"}
                                            />
                                            <FormDescription>Must be linked to this account.</FormDescription>
                                            <FormMessage>{errors.destination_location_id?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Tags / Attachments / Budgets — linked after creation, see onSubmit */}
                        <div className="flex flex-col gap-8 pt-6 border-t">
                            <LinkedItemsSection
                                title="Tags"
                                linkedItems={pendingTags}
                                linkedLoading={false}
                                options={tagOptions}
                                comboboxPlaceholder="Select a tag to link"
                                renderItemLabel={(tag) => tag.name}
                                onLink={addPending(setPendingTags, tags)}
                                onUnlink={removePending(setPendingTags)}
                            />

                            <LinkedItemsSection
                                title="Attachments"
                                linkedItems={pendingAttachments}
                                linkedLoading={false}
                                options={attachmentOptions}
                                comboboxPlaceholder="Select an attachment to link"
                                renderItemLabel={(attachment) => attachment.filename}
                                onLink={addPending(setPendingAttachments, attachments)}
                                onUnlink={removePending(setPendingAttachments)}
                            />

                            <LinkedItemsSection
                                title="Budgets"
                                linkedItems={pendingBudgets}
                                linkedLoading={false}
                                options={budgetOptions}
                                comboboxPlaceholder="Select a budget to link"
                                renderItemLabel={(budget) => budget.name}
                                onLink={addPending(setPendingBudgets, budgets)}
                                onUnlink={removePending(setPendingBudgets)}
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full max-w-xs">
                            <Button type="submit" disabled={isSubmitting}>Submit</Button>
                            <Button type="button" onClick={onBack}>Back</Button>
                        </div>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

export default TransactionAddPage
