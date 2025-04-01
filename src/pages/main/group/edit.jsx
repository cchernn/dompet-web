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
})

function GroupEditPage() {
    const { group_id } = useParams()
    const [group, setGroup] = useState({})
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
                const response = await authService.editData(`/transactions/groups/${group_id}`, data)
                console.log(response, data)
                navigate(`/transactions/groups`)
            } catch (error) {
                console.error("Error", error)
            }
        }
    
    const onBack = () => {
        navigate(-1)
    }

    useEffect(() => {
        fetchGroup()
    }, [])

    async function fetchGroup() {
        try {
            const response = await authService.fetchData(`/transactions/groups/${group_id}`)
            const data = response
            setGroup(data)
            resetForm(data)
        } catch (error) {
            console.log("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function setFormData(data) {
        return {
            name: data.name ?? null,
        }
    }

    function resetForm(data)  {
        form.reset({
            name: data.name ?? "",
        })
    }

    return (
        <>
            <h2>Group: {group_id}</h2>
            { loading && (<p>Loading Groups</p>) }
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
                                        <Input placeholder="Group Name" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.name?.message}</FormMessage>
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

export default GroupEditPage