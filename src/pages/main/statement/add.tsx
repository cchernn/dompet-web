import { useNavigate } from "react-router-dom"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { createStatement } from "@/api/statements"
import { createStatementSeries } from "@/api/statementSeries"
import { searchAccounts } from "@/api/accounts"
import { CURRENCIES } from "@/lib/currencies"
import type { BillRecurrenceUnit } from "@/api/types"

// Shared with the Bills/Transactions forms — same cache key, so switching
// between pages doesn't re-fetch.
const ACCOUNT_PAGE_SIZE = 1000

const RECURRENCE_UNIT_LABELS: Record<BillRecurrenceUnit, string> = {
    day: "Day(s)",
    week: "Week(s)",
    month: "Month(s)",
    year: "Year(s)",
}

const formSchema = z.object({
    mode: z.enum(["one_off", "recurring"]),
    account_id: z.string().nullable().optional(),
    currency_code: z.string().nullable().optional(),
    statement_date: z.date().nullable().optional(),
    period_start: z.date().nullable().optional(),
    period_end: z.date().nullable().optional(),
    received_date: z.date().nullable().optional(),
    // Left as text — blank means "not provided" rather than zero.
    opening_balance: z.string().optional(),
    closing_balance: z.string().optional(),
    notes: z.string().optional(),
    recurrence_unit: z.enum(["day", "week", "month", "year"]).optional(),
    recurrence_count: z.coerce.number().int().optional(),
    anchor_date: z.date().nullable().optional(),
}).superRefine((data, ctx) => {
    if (!data.account_id) {
        ctx.addIssue({ path: ["account_id"], code: z.ZodIssueCode.custom, message: "Account is required" })
    }
    if (data.mode === "one_off") {
        if (!data.statement_date) {
            ctx.addIssue({ path: ["statement_date"], code: z.ZodIssueCode.custom, message: "Statement date is required" })
        }
        if (!data.period_start) {
            ctx.addIssue({ path: ["period_start"], code: z.ZodIssueCode.custom, message: "Period start is required" })
        }
        if (!data.period_end) {
            ctx.addIssue({ path: ["period_end"], code: z.ZodIssueCode.custom, message: "Period end is required" })
        }
        if (data.period_start && data.period_end && data.period_end < data.period_start) {
            ctx.addIssue({ path: ["period_end"], code: z.ZodIssueCode.custom, message: "Period end must not be before period start" })
        }
        const hasBalance = Boolean(data.opening_balance?.trim() || data.closing_balance?.trim())
        if (hasBalance && !data.currency_code) {
            ctx.addIssue({ path: ["currency_code"], code: z.ZodIssueCode.custom, message: "Currency is required when a balance is given" })
        }
    } else {
        if (!data.anchor_date) {
            ctx.addIssue({ path: ["anchor_date"], code: z.ZodIssueCode.custom, message: "First statement date is required" })
        }
        if (!data.recurrence_unit) {
            ctx.addIssue({ path: ["recurrence_unit"], code: z.ZodIssueCode.custom, message: "Required" })
        }
        if (!data.recurrence_count || data.recurrence_count <= 0) {
            ctx.addIssue({ path: ["recurrence_count"], code: z.ZodIssueCode.custom, message: "Must be a positive number" })
        }
    }
})

function StatementAddPage() {
    const navigate = useNavigate()
    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: ACCOUNT_PAGE_SIZE }))
    const accountOptions: ComboboxOption[] = (accountsData ?? []).map((a) => ({ value: a.id, label: a.name }))

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mode: "one_off",
            account_id: null,
            currency_code: null,
            statement_date: null,
            period_start: null,
            period_end: null,
            received_date: null,
            opening_balance: "",
            closing_balance: "",
            notes: "",
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
                await createStatement({
                    account_id: data.account_id!,
                    statement_date: format(data.statement_date!, "yyyy-MM-dd"),
                    period_start: format(data.period_start!, "yyyy-MM-dd"),
                    period_end: format(data.period_end!, "yyyy-MM-dd"),
                    received_date: data.received_date ? format(data.received_date, "yyyy-MM-dd") : undefined,
                    opening_balance: data.opening_balance?.trim() ? parseFloat(data.opening_balance) : undefined,
                    closing_balance: data.closing_balance?.trim() ? parseFloat(data.closing_balance) : undefined,
                    currency_code: data.currency_code || undefined,
                    notes: data.notes?.trim() || undefined,
                })
                toast.success("Statement created")
            } else {
                await createStatementSeries({
                    account_id: data.account_id!,
                    currency_code: data.currency_code || undefined,
                    recurrence_unit: data.recurrence_unit!,
                    recurrence_count: data.recurrence_count!,
                    anchor_date: format(data.anchor_date!, "yyyy-MM-dd"),
                })
                toast.success("Recurring statement created")
            }
            navigate("/statements")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>New Statement</CardTitle>
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
                                            ? "A single statement for one period."
                                            : "Creates a recurring series — occurrences are generated automatically as each statement date arrives. An account can only have one active series."}
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="account_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account</FormLabel>
                                    <Combobox
                                        options={accountOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select an account"
                                        searchPlaceholder="Search accounts"
                                        emptyText="No account found"
                                    />
                                    <FormDescription>The account this statement is issued by.</FormDescription>
                                    <FormMessage>{errors.account_id?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="currency_code"
                            render={({ field }) => (
                                <FormItem className="w-40">
                                    <FormLabel>Currency</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? undefined}
                                    >
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
                                    <FormDescription>Only required if a balance is entered below.</FormDescription>
                                    <FormMessage>{errors.currency_code?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {mode === "one_off" ? (
                            <>
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
                                                            selected={field.value ?? undefined}
                                                            onSelect={field.onChange}
                                                            defaultMonth={field.value ?? new Date()}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormDescription>When the statement was issued (or is expected to be).</FormDescription>
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
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className="w-full sm:w-56 justify-start font-normal">
                                                                <CalendarIcon />
                                                                {field.value ? format(field.value, "PPP") : <span>Not yet received</span>}
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
                                                <FormDescription>Optional — leave blank until it actually arrives.</FormDescription>
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
                                                            selected={field.value ?? undefined}
                                                            onSelect={field.onChange}
                                                            defaultMonth={field.value ?? new Date()}
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
                                                            selected={field.value ?? undefined}
                                                            onSelect={field.onChange}
                                                            defaultMonth={field.value ?? form.getValues("period_start") ?? new Date()}
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
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="anchor_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Statement Date</FormLabel>
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
                                                Can&apos;t be changed later — every occurrence&apos;s statement date is computed from this. Each occurrence&apos;s period starts the day after the previous occurrence&apos;s statement date.
                                            </FormDescription>
                                            <FormMessage>{errors.anchor_date?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-2 items-end">
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

export default StatementAddPage
