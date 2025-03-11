import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import authService from "@/lib/authService"

const formSchema = z.object({
    date: z.date(),
    name: z.string()
    .min(1, {message: "Name is required"})
    .max(32, {message: 'Name must be less than 32 characters'}),
    amount: z.coerce.number()
    .transform((val) => parseFloat(val.toFixed(2))),
    payment_method: z.string(),
    category: z.string(),
    currency: z.string()
    .max(3, {message: "Invalid currency code, please follow ISO 4217 currency code format (3 letters)."}),
    type: z.enum([
        "expenditure",
        "income",
        "transfer",
    ]),
})

function TransactionEditPage() {
    const { transaction_id } = useParams()
    const [transaction, setTransaction] = useState({})
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(formSchema),
    })

    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data) => {
        try {
            data = setFormData(data)
            const response = await authService.editData(`/transactions/${transaction_id}`, data)
            navigate(`/transactions`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const onBack = () => {
        navigate(-1)
    }

    useEffect(() => {
        fetchTransaction()
    }, [])

    async function fetchTransaction() {
        try {
            const response = await authService.fetchData(`/transactions/${transaction_id}`)
            const data = response
            setTransaction(data)
            resetForm(data)

        } catch (error) {
            console.log("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function setFormData(data) {
        return {
            ...data,
            date: data.date ? data.date.toISOString().split('T')[0] : null,
            name: data.name || null,
            amount: data.amount ? parseFloat(data.amount).toFixed(2) : 0,
            payment_method: data.payment_method || null,
            category: data.category || null,
            currency: data.currency || null,
            type: data.type || null,
        }
    }

    function resetForm(data)  {
        form.reset({
            date: data ? new Date(data.date) : null,
            name: data ? data.name : null,
            amount: data ? parseFloat(data.amount).toFixed(2) : 0,
            payment_method: data ? data.payment_method : null,
            category: data ? data.category : null,
            currency: data ? data.currency : "MYR",
            type: data ? data.type : "expenditure",
        })
    }

    return (
        <>
            <h2>Transaction: {transaction_id}</h2>
            { loading && (<p>Loading Transactions</p>) }
            { !loading && 
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                                <Button 
                                                    variant={"outline"}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => 
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
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

                        {/* Amount Field */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Amount" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.amount?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Payment Method Field */}
                        <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Payment Method" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.payment_method?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Category Field */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.category?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Currency Field */}
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Currency" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.currency?.message}</FormMessage>
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
                                    <FormDescription />
                                    <FormMessage>{errors.type?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting}>Submit</Button>
                    </form>
                </Form>
                
            }
            <Button type="button" onClick={onBack}>Back</Button>
        </>
    )
}

export default TransactionEditPage