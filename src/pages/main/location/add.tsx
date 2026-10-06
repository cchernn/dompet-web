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
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/lib/toast"
import { createLocation } from "@/api/locations"
import type { LocationInput } from "@/api/types"

const formSchema = z.object({
    type: z.enum(["physical", "online"]),
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be less than 255 characters" }),
    google_maps_url: z.string().optional(),
    url: z.string().optional(),
    visibility: z.enum(["private", "public"]),
})

function LocationAddPage() {
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "physical",
            name: "",
            google_maps_url: "",
            url: "",
            visibility: "private",
        }
    })

    const {
        formState: { errors, isSubmitting }
    } = form

    const type = form.watch("type")

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const body: LocationInput = {
                type: data.type,
                name: data.name,
                is_public: data.visibility === "public",
                ...(data.type === "physical"
                    ? { google_maps_url: data.google_maps_url || undefined }
                    : { url: data.url || undefined }),
            }
            await createLocation(body)
            toast.success("Location created.")
            navigate(`/locations`)
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => {
        navigate(-1)
    }

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>New Location</CardTitle>
                </CardHeader>
                <Form {...form}>
                    <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                                                <SelectValue placeholder="Select a location type." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="physical">Physical</SelectItem>
                                            <SelectItem value="online">Online</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription />
                                    <FormMessage>{errors.type?.message}</FormMessage>
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
                                        <Input placeholder="Location Name" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Conditional URL field, based on type */}
                        {type === "physical" ? (
                            <FormField
                                control={form.control}
                                name="google_maps_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Google Maps URL</FormLabel>
                                        <FormControl>
                                            <Input type="url" placeholder="Google Maps URL" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.google_maps_url?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Site URL</FormLabel>
                                        <FormControl>
                                            <Input type="url" placeholder="Site URL" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.url?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Visibility Field */}
                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Visibility</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select visibility." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="private">Private</SelectItem>
                                            <SelectItem value="public">Public</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Private locations are only visible to you. This cannot be changed later.</FormDescription>
                                    <FormMessage>{errors.visibility?.message}</FormMessage>
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

export default LocationAddPage
