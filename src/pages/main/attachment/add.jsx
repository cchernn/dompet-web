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
    filename: z.string()
    .min(1, {message: "Filename is required"})
    .max(32, {message: 'Filename must be less than 32 characters'}),
    url: z.string()
    .url({message: "Invalid URL format"}),
    type: z.enum([
        "pdf",
        "jpeg",
        "png",
        "xlsx",
    ])
})

function AttachmentAddPage() {
    const navigate = useNavigate()
    
    const form = useForm({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name: "",
                filename: "",
                url: "",
                type: "",
            }
        })
    
    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data) => {
        try {
            data = setFormData(data)
            const response = await authService.addData(`/attachments`, data)
            navigate(`/attachments`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const onBack = () => {
        navigate(-1)
    }

    function setFormData(data) {
        return {
            ...data,
            date: data.date ? data.date.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }) : null,
            name: data.name || null,
            filename: data.filename || null,
            url: data.url || null,
            type: data.type || null,
        }
    }

    return (
        <>
            <h2>New Attachment</h2>
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
                                    <Input placeholder="Attachment Name" {...field} />
                                </FormControl>
                                <FormDescription />
                                <FormMessage>{errors.name?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* URL Field */}
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="url"
                                        placeholder="Attachment URL" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription />
                                <FormMessage>{errors.url?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/* Filename Field */}
                    <FormField
                        control={form.control}
                        name="filename"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Filename</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Attachment Filename" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription />
                                <FormMessage>{errors.filename?.message}</FormMessage>
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
                                <FormControl>
                                    <Input 
                                        placeholder="Attachment Type" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription />
                                <FormMessage>{errors.type?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting}>Submit</Button>
                </form>
            </Form>
            <Button type="button" onClick={onBack}>Back</Button>
        </>
    )
}

export default AttachmentAddPage