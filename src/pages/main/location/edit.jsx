import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { getLocation, updateLocation } from "@/api/locations"

const formSchema = z.object({
    type: z.enum(["physical", "online"]),
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be less than 255 characters" }),
    google_maps_url: z.string().optional(),
    url: z.string().optional(),
})

function LocationEditPage() {
    const { location_id } = useParams()
    const [location, setLocation] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(formSchema),
    })

    const {
        formState: { errors, isSubmitting }
    } = form

    const type = form.watch("type")

    useEffect(() => {
        fetchLocation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location_id])

    async function fetchLocation() {
        try {
            const { data } = await getLocation(location_id)
            setLocation(data)
            form.reset({
                type: data.type,
                name: data.name ?? "",
                google_maps_url: data.google_maps_url ?? "",
                url: data.url ?? "",
            })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data) => {
        try {
            // The backend's update_location does NOT re-apply the type-exclusivity
            // nulling that create_location does, so we must always send BOTH
            // fields explicitly here: the one matching the current type gets its
            // value, the other is explicitly nulled — otherwise a type change (or
            // stale prior data) can leave both fields set on the row.
            const body = {
                type: data.type,
                google_maps_url: data.type === "physical" ? (data.google_maps_url || null) : null,
                url: data.type === "online" ? (data.url || null) : null,
            }
            if (data.name && data.name !== location.name) {
                body.name = data.name
            }
            await updateLocation(location_id, body)
            toast.success("Location updated.")
            navigate(`/locations`)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onBack = () => {
        navigate(-1)
    }

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Location ID: {location_id}</CardTitle>
                </CardHeader>
                {
                    loading ?
                        <div>
                            <Skeleton className="h-6 w-full my-2" />
                            <Skeleton className="h-6 w-full my-2" />
                        </div>
                    :
                    <Form {...form}>
                        <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                            {/* Type Field */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
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

export default LocationEditPage
