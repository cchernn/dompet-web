import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Trash2 } from "lucide-react"
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
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/loading-state"
import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import Alert from "@/lib/alertDialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { useCurrentUserId, isOwnedBy } from "@/hooks/use-current-user-id"
import { getBillSeries, updateBillSeries, deleteBillSeries } from "@/api/billSeries"
import { searchAccounts } from "@/api/accounts"
import { searchCategories } from "@/api/categories"
import { CURRENCIES } from "@/lib/currencies"
import type { BillSeries, BillSeriesPatch, BillRecurrenceUnit } from "@/api/types"

const ACCOUNT_CATEGORY_PAGE_SIZE = 1000

const RECURRENCE_UNIT_LABELS: Record<BillRecurrenceUnit, string> = {
    day: "Day(s)",
    week: "Week(s)",
    month: "Month(s)",
    year: "Year(s)",
}

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
    recurrence_unit: z.enum(["day", "week", "month", "year"]),
    recurrence_count: z.coerce.number().int().min(1, { message: "Must be a positive number" }),
})

function BillSeriesEditPage() {
    const { series_id } = useParams<{ series_id: string }>()
    const navigate = useNavigate()

    const [series, setSeries] = useState<BillSeries | null>(null)
    const currentUserId = useCurrentUserId()
    const owned = isOwnedBy(series?.user_id, currentUserId)
    const [loading, setLoading] = useState(true)

    const { data: accountsData } = useCachedResource("accounts:search", () => searchAccounts({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const { data: categoriesData } = useCachedResource("categories:search", () => searchCategories({ pageSize: ACCOUNT_CATEGORY_PAGE_SIZE }))
    const accountOptions: ComboboxOption[] = (accountsData ?? []).map((a) => ({ value: a.id, label: a.name }))
    const categoryOptions: ComboboxOption[] = (categoriesData ?? []).map((c) => ({ value: c.id, label: c.name }))

    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) })
    const { formState: { errors, isSubmitting } } = form

    useEffect(() => {
        fetchSeries()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [series_id])

    async function fetchSeries() {
        try {
            const { data } = await getBillSeries(series_id!)
            setSeries(data)
            form.reset({
                name: data.name ?? "",
                amount: parseFloat(data.amount),
                currency_code: data.currency_code,
                category_id: data.category_id ?? null,
                account_id: data.account_id ?? null,
                recurrence_unit: data.recurrence_unit,
                recurrence_count: data.recurrence_count,
            })
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const patch: BillSeriesPatch = {
                name: data.name,
                amount: data.amount,
                currency_code: data.currency_code,
                category_id: data.category_id || undefined,
                account_id: data.account_id || undefined,
                recurrence_unit: data.recurrence_unit,
                recurrence_count: data.recurrence_count,
            }
            const { data: updated } = await updateBillSeries(series_id!, patch)
            setSeries(updated)
            toast.success("Series updated")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteBillSeries(series_id!)
            toast.success("Series deactivated")
            navigate("/bills")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4 w-full">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle>Bill Series ID: {series_id}</CardTitle>
                        {series && owned && (
                            <Alert
                                button_text={<><Trash2 />Deactivate</>}
                                title="Deactivate Series"
                                description="This stops future occurrences from being generated. Occurrences already created are untouched and stay on the Bills list."
                                action={handleDelete}
                            />
                        )}
                    </div>
                </CardHeader>
                {loading || currentUserId === undefined ? (
                    <LoadingState />
                ) : !owned ? (
                    <p className="text-sm text-muted-foreground">
                        This series belongs to another user, so it can&apos;t be edited here.
                    </p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant={series?.is_active ? "secondary" : "outline"}>
                                {series?.is_active ? "Active" : "Deactivated"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                First due {series && format(parse(series.anchor_date, "yyyy-MM-dd", new Date()), "d MMM yyyy")} (fixed)
                            </span>
                        </div>

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
                                            <FormDescription>
                                                Only affects occurrences generated from now on — past/current ones keep their own copy.
                                            </FormDescription>
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
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                <p className="text-xs text-muted-foreground -mt-4">
                                    Only applies to occurrences generated after this change.
                                </p>

                                <div className="flex flex-col gap-2 w-full max-w-xs">
                                    <Button type="submit" disabled={isSubmitting}>Save</Button>
                                    <Button type="button" onClick={onBack}>Back</Button>
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </Card>
        </div>
    )
}

export default BillSeriesEditPage
