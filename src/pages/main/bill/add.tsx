import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { LinkedItemsSection } from "@/components/linked-items-section"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { createBill } from "@/api/bills"
import { createBillSeries } from "@/api/billSeries"
import { linkBillBudget } from "@/api/billBudgets"
import { searchAccounts } from "@/api/accounts"
import { searchCategories } from "@/api/categories"
import { listBudgets } from "@/api/budgets"
import { CURRENCIES } from "@/lib/currencies"
import type { BillRecurrenceUnit, Budget } from "@/api/types"

// Shared with the transaction forms — same cache keys, so switching between
// pages doesn't re-fetch.
const ACCOUNT_CATEGORY_PAGE_SIZE = 1000

const RECURRENCE_UNIT_LABELS: Record<BillRecurrenceUnit, string> = {
    day: "Day(s)",
    week: "Week(s)",
    month: "Month(s)",
    year: "Year(s)",
}

const formSchema = z.object({
    mode: z.enum(["one_off", "recurring"]),
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be less than 255 characters" }),
    amount: z.coerce.number()
        .min(0, { message: "Amount must be zero or greater" })
        .transform((val) => parseFloat(val.toFixed(2))),
    currency_code: z.string().length(3, { message: "Select a currency" }),
    category_id: z.string().nullable().optional(),
    account_id: z.string().nullable().optional(),
    due_date: z.date().nullable().optional(),
    recurrence_unit: z.enum(["day", "week", "month", "year"]).optional(),
    recurrence_count: z.coerce.number().int().optional(),
    anchor_date: z.date().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.mode === "one_off" && !data.due_date) {
        ctx.addIssue({ path: ["due_date"], code: z.ZodIssueCode.custom, message: "Due date is required" })
    }
    if (data.mode === "recurring") {
        if (!data.anchor_date) {
            ctx.addIssue({ path: ["anchor_date"], code: z.ZodIssueCode.custom, message: "First due date is required" })
        }
        if (!data.recurrence_unit) {
            ctx.addIssue({ path: ["recurrence_unit"], code: z.ZodIssueCode.custom, message: "Required" })
        }
        if (!data.recurrence_count || data.recurrence_count <= 0) {
            ctx.addIssue({ path: ["recurrence_count"], code: z.ZodIssueCode.custom, message: "Must be a positive number" })
        }
    }
})

function BillAddPage() {
    const navigate = useNavigate()
    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const { data: categoriesData } = useCachedResource("categories:search", () => searchCategories({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const { data: budgetsData } = useCachedResource("budgets:list", () => listBudgets({ pageSize: 100 }))
    const accountOptions: ComboboxOption[] = (accountsData ?? []).map((a) => ({ value: a.id, label: a.name }))
    const categoryOptions: ComboboxOption[] = (categoriesData ?? []).map((c) => ({ value: c.id, label: c.name }))
    const budgets = budgetsData ?? []
    const budgetOptions: ComboboxOption[] = budgets.map((b) => ({ value: b.id, label: b.name }))

    // Only a one-off bill gets a real id back synchronously on create — a
    // recurring series' first occurrence is generated server-side after the
    // fact (see createBillSeries), so there's no bill id yet to link a
    // budget to here. Budget sharing for a recurring bill has to happen
    // from that occurrence's own Edit page once it shows up on the list.
    const [pendingBudgets, setPendingBudgets] = useState<Budget[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mode: "one_off",
            name: "",
            amount: 0,
            currency_code: "MYR",
            category_id: null,
            account_id: null,
            due_date: null,
            recurrence_unit: "month",
            recurrence_count: 1,
            anchor_date: null,
        },
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    const mode = form.watch("mode")

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            if (data.mode === "one_off") {
                const { data: created } = await createBill({
                    name: data.name,
                    amount: data.amount,
                    currency_code: data.currency_code,
                    category_id: data.category_id || undefined,
                    account_id: data.account_id || undefined,
                    due_date: format(data.due_date!, "yyyy-MM-dd"),
                })

                // The bill now exists, so pending budget selections can
                // actually be linked. A failure here shouldn't block
                // navigation — the bill itself was created fine — so each
                // link is caught individually and reported.
                let linkFailures = 0
                for (const budget of pendingBudgets) {
                    try {
                        await linkBillBudget(created.id, budget.id)
                    } catch (error) {
                        linkFailures += 1
                        toast.error(`Couldn't share with budget "${budget.name}": ${(error as Error).message}`)
                    }
                }
                toast.success(linkFailures > 0 ? "Bill created (some budget links failed)" : "Bill created")
            } else {
                await createBillSeries({
                    name: data.name,
                    amount: data.amount,
                    currency_code: data.currency_code,
                    category_id: data.category_id || undefined,
                    account_id: data.account_id || undefined,
                    recurrence_unit: data.recurrence_unit!,
                    recurrence_count: data.recurrence_count!,
                    anchor_date: format(data.anchor_date!, "yyyy-MM-dd"),
                })
                toast.success("Recurring bill created")
            }
            navigate("/bills")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>New Bill</CardTitle>
                </CardHeader>
                <Form {...form}>
                    <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                        {/* Mode toggle — not sent as-is, just picks which API call onSubmit makes */}
                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("one_off")}
                                            className={cn(
                                                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-sm font-medium transition-colors",
                                                field.value === "one_off" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                                            )}
                                        >
                                            One-off
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("recurring")}
                                            className={cn(
                                                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-sm font-medium transition-colors",
                                                field.value === "recurring" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                                            )}
                                        >
                                            Recurring
                                        </button>
                                    </div>
                                    <FormDescription>
                                        {field.value === "one_off"
                                            ? "A single bill due once."
                                            : "Creates a recurring series — occurrences are generated automatically as each due date arrives."}
                                    </FormDescription>
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
                                        <Input placeholder="Bill Name" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.name?.message}</FormMessage>
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

                        {/* Category / Account — both optional */}
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

                        {mode === "one_off" ? (
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
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription />
                                        <FormMessage>{errors.due_date?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="anchor_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Due Date</FormLabel>
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
                                                        selected={field.value ?? undefined}
                                                        onSelect={field.onChange}
                                                        defaultMonth={field.value ?? new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                Can&apos;t be changed later — every future occurrence&apos;s due date is computed from this.
                                            </FormDescription>
                                            <FormMessage>{errors.anchor_date?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-2 items-end">
                                    <Label className="sr-only">Repeat every</Label>
                                    <FormField
                                        control={form.control}
                                        name="recurrence_count"
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                <FormLabel>Repeat every</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" step="1" {...field} />
                                                </FormControl>
                                                <FormMessage>{errors.recurrence_count?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="recurrence_unit"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Unit" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(Object.entries(RECURRENCE_UNIT_LABELS) as [BillRecurrenceUnit, string][]).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage>{errors.recurrence_unit?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {mode === "one_off" ? (
                            <div className="pt-6 border-t">
                                <LinkedItemsSection
                                    title="Budgets"
                                    linkedItems={pendingBudgets}
                                    linkedLoading={false}
                                    options={budgetOptions}
                                    comboboxPlaceholder="Select a budget to share this bill with"
                                    renderItemLabel={(budget) => budget.name}
                                    onLink={(id) => {
                                        const budget = budgets.find((b) => b.id === id)
                                        if (budget) setPendingBudgets((prev) => [...prev, budget])
                                    }}
                                    onUnlink={(budget) => setPendingBudgets((prev) => prev.filter((b) => b.id !== budget.id))}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Linked after the bill is created. Budget members will see this bill (and its payments) in their own Bills list.
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Budget sharing isn&apos;t available here for a recurring bill — set it up from the first generated occurrence&apos;s Edit page once it appears on the Bills list.
                            </p>
                        )}

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

export default BillAddPage
