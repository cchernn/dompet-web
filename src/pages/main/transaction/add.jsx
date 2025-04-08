import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronsUpDown, CalendarIcon, MoreHorizontal } from "lucide-react"
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
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    location: z.number().nullable().optional(),
    attachments: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
        })
    ).nullable().optional(),
    groups: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
        })
    ).nullable().optional(),
})

function TransactionAddPage() {
    const navigate = useNavigate()
    const [locations, setLocations] = useState([])
    const [attachments, setAttachments] = useState([])
    const [groups, setGroups] = useState([])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            amount: 0,
            payment_method: "",
            category: "",
            currency: "MYR",
            type: "expenditure",            
        }
    })

    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data) => {
        try {
            data = setFormData(data)
            const response = await authService.addData(`/transactions`, data)
            navigate(`/transactions`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const onBack = () => {
        navigate(-1)
    }

    useEffect(() => {
        fetchGroups()
        fetchLocations()
        fetchAttachments()
    }, [])

    function setFormData(data) {
        return {
            // ...data,
            date: data.date ? data.date.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }) : null,
            name: data.name ?? null,
            amount: data.amount ? parseFloat(data.amount).toFixed(2) : 0,
            payment_method: data.payment_method ?? null,
            category: data.category ?? null,
            currency: data.currency ?? null,
            type: data.type ?? null,
            location: data.location ?? null,
            attachment: data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0
                ? data.attachments.map((attachment) => attachment.id).join("|") 
                : null,
            group: data.groups && Array.isArray(data.groups) && data.groups.length > 0
                ? data.groups.map((group) => group.id).join("|") 
                : null,
        }
    }

    async function fetchLocations() {
        try {
            const response = await authService.fetchData("/locations")
            const data = processLocations(response)
            setLocations(data)
        } catch (error) {
            console.error("Error", error)
        }
    }

    function processLocations(data) {
        return data.map((tx) => ({
            id: tx.id,
            name: tx.name,
            url: tx.url,
            google_page_link: tx.google_page_link,
            google_maps_link: tx.google_maps_link,
            category: tx.category,
            access_type: tx.access_type,
        }))
    }

    async function fetchAttachments() {
        try {
            const response = await authService.fetchData("/attachments")
            const data = processAttachments(response)
            setAttachments(data)
        } catch (error) {
            console.error("Error", error)
        }
    }

    function processAttachments(data) {
        return data.map((tx) => ({
            id: tx.id,
            date: tx.date,
            name: tx.name,
            url: tx.url,
            filename: tx.filename,
            type: tx.type,
        }))
    }

    async function fetchGroups() {
        try {
            const response = await authService.fetchData("/transactions/groups")
            const data = processGroups(response)
            setGroups(data)
        } catch (error) {
            console.error("Error", error)
        }
    }

    function processGroups(data) {
        return data.map((tx) => ({
            id: tx.id,
            name: tx.name,
        }))
    }
    
    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 items-start justify-start">
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

                    {/* Location Field */}
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                            >
                                                {field.value ?
                                                    locations.find((location) =>
                                                        location.id === field.value
                                                    )?.name
                                                    : "Select a location"
                                                }
                                                <ChevronsUpDown />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Command>
                                            <CommandInput 
                                                placeholder="Search location"
                                            />
                                            <CommandList>
                                                <CommandEmpty>No Location Found</CommandEmpty>
                                                <CommandGroup>
                                                    {locations.map((location) => (
                                                        <CommandItem
                                                            value={location.id}
                                                            key={location.id}
                                                            onSelect={() =>
                                                                form.setValue("location", location.id)
                                                            }
                                                        >
                                                            {location.name}
                                                            <Check 
                                                                className={location.id===field.value ? "opacity-100" : "opacity-0"}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormDescription />
                                <FormMessage>{errors.type?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Attachments Field */}
                    <FormField
                        control={form.control}
                        name="attachments"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attachments</FormLabel>
                                <>
                                    {(field.value || []).map((attachment) => {
                                        return (<Badge key={attachment.id}>{attachment.name}</Badge>)
                                    })}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost"><MoreHorizontal /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {attachments.map((attachment) => {
                                                const isChecked = (field.value || []).some((item) => item.id === attachment.id);
                                                
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={attachment.id}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const updatedAttachments  = checked
                                                                ? [...(field.value || []), attachment]
                                                                : field.value.filter((item) => item.id !== attachment.id)
                                                            field.onChange(updatedAttachments)
                                                        }}
                                                    >
                                                        {attachment.name}
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                                <FormDescription />
                                <FormMessage>{errors.attachments?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Groups Field */}
                    <FormField
                        control={form.control}
                        name="groups"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Groups</FormLabel>
                                <>
                                    {(field.value || []).map((group) => {
                                        return (<Badge key={group.id}>{group.name}</Badge>)
                                    })}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost"><MoreHorizontal /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {groups.map((group) => {
                                                const isChecked = (field.value || []).some((item) => item.id === group.id);
                                                
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={group.id}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const updatedGroups = checked
                                                                ? [...(field.value || []), group]
                                                                : field.value.filter((item) => item.id !== group.id)
                                                            field.onChange(updatedGroups)
                                                        }}
                                                    >
                                                        {group.name}
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                                <FormDescription />
                                <FormMessage>{errors.groups?.message}</FormMessage>
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