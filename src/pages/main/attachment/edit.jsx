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
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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

function AttachmentEditPage() {
    const { attachment_id } = useParams()
    const [attachment, setAttachment] = useState({})
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(formSchema)
    })

    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data) => {
            try {
                data = setFormData(data)
                const response = await authService.editData(`/attachments/${attachment_id}`, data)
                navigate(`/attachments`)
            } catch (error) {
                console.error("Error", error)
            }
        }
    
    const onBack = () => {
        navigate(-1)
    }

    useEffect(() => {
        fetchAttachment()
    }, [])

    async function fetchAttachment() {
        try {
            const response = await authService.fetchData(`/attachments/${attachment_id}`)
            const data = response
            setAttachment(data)
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
            date: data.date ? data.date.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }) : null,
            name: data.name ?? null,
            url: data.url ?? null,
            filename: data.filename ?? null,
            type: data.type ?? null,
        }
    }

    function resetForm(data)  {
        form.reset({
            date: data ? new Date(data.date) : null,
            name: data.name ?? "",
            url: data.url ?? "",
            filename: data.filename ?? "",
            type: data.type ?? "",
        })
    }

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 items-start justify-start">
            <CardHeader className="pt-0 pb-4">
                <CardTitle>Attachment: {attachment_id}</CardTitle>
            </CardHeader>
            { loading && (<p>Loading Attachments</p>) }
            { !loading &&
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

                        <div className="flex flex-col gap-2 w-full max-w-xs">
                            <Button type="submit" disabled={isSubmitting}>Submit</Button>
                            <Button type="button" onClick={onBack}>Back</Button>
                        </div>
                    </form>
                </Form>
            }
            </Card>
        </div>
    )
}

export default AttachmentEditPage