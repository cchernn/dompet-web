import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon } from "lucide-react"
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
import { Combobox } from "@/components/ui/combobox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createTransaction } from "@/api/transactions"
import { listAccounts } from "@/api/accounts"
import { listCategories } from "@/api/categories"
import { CURRENCIES } from "@/lib/currencies"

const formSchema = z.object({
    date: z.date({ required_error: "Date is required" }),
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

function TransactionAddPage() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState([])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "expenditure",
            amount: 0,
            currency_code: "MYR",
            category_id: null,
        },
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    useEffect(() => {
        listAccounts({ pageSize: 100 })
            .then(({ data }) => setAccounts(data))
            .catch((error) => toast.error(error.message))
        listCategories({ pageSize: 100 })
            .then(({ data }) => setCategories(data))
            .catch((error) => toast.error(error.message))
    }, [])

    const accountOptions = accounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }))
    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

    const onSubmit = async (data) => {
        try {
            await createTransaction({
                date: data.date.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }),
                name: data.name,
                type: data.type,
                amount: data.amount,
                currency_code: data.currency_code,
                category_id: data.category_id || undefined,
                source_account_id: data.source_account_id,
                destination_account_id: data.destination_account_id,
            })
            toast.success("Transaction created")
            navigate("/transactions")
        } catch (error) {
            toast.error(error.message)
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <FormDescription>
                                        Purely descriptive — both accounts below are always your own accounts, there is no separate external/system account.
                                    </FormDescription>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </Card>
        </div>
    )
}

export default TransactionAddPage
