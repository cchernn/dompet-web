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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import authService from "@/lib/authService"

const formSchema = z.object({
    name: z.string()
    .min(1, {message: "Name is required"})
    .max(32, {message: 'Name must be less than 32 characters'}),
    url: z.string()
    // .url({message: "Invalid URL format"})
    .optional().nullable(),
    google_page_link: z.string()
    // .url({message: "Invalid URL format"})
    .optional().nullable(),
    google_maps_link: z.string()
    // .url({message: "Invalid URL format"})
    .optional().nullable(),
    category: z.string()
    .max(32, {message: 'Category must be less than 32 characters'}),
    access_type: z.string()
    .max(32, {message: 'Access Type must be less than 32 characters'}),
})

function LocationEditPage() {
    const { location_id } = useParams()
    const [location, setLocation] = useState({})
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
                console.log("data", data)
                data = setFormData(data)
                const response = await authService.editData(`/locations/${location_id}`, data)
                console.log(response, data)
                navigate(`/locations`)
            } catch (error) {
                console.error("Error", error)
            }
        }
    
    const onBack = () => {
        navigate(-1)
    }

    useEffect(() => {
        fetchLocation()
    }, [])

    async function fetchLocation() {
        try {
            const response = await authService.fetchData(`/locations/${location_id}`)
            const data = response
            setLocation(data)
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
            name: data.name ?? null,
            url: data.url ?? null,
            google_page_link: data.google_page_link ?? null,
            google_maps_link: data.google_maps_link ?? null,
            category: data.category ?? null,
            access_type: data.access_type ?? null,
        }
    }

    function resetForm(data)  {
        form.reset({
            name: data.name ?? "",
            url: data.url ?? "",
            google_page_link: data.google_page_link ?? "",
            google_maps_link: data.google_maps_link ?? "",
            category: data.category ?? "",
            access_type: data.access_type ?? "",
        })
    }

    return (
        <>
            <h2>Location: {location_id}</h2>
            { loading && (<p>Loading Locations</p>) }
            { !loading &&
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                            placeholder="Location URL" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.url?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Google Page Link Field */}
                        <FormField
                            control={form.control}
                            name="google_page_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Page Link</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="url"
                                            placeholder="Location Google Page Link" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.google_page_link?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Google Maps Link Field */}
                        <FormField
                            control={form.control}
                            name="google_maps_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Maps Link</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="url"
                                            placeholder="Location Google Maps Link" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.google_maps_link?.message}</FormMessage>
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
                                        <Input placeholder="Location Category" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.category?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Access Type Field */}
                        <FormField
                            control={form.control}
                            name="access_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Access Type</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Location Access Type" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.access_type?.message}</FormMessage>
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

export default LocationEditPage