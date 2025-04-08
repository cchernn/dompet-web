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
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Group: {group_id}</CardTitle>
                </CardHeader>
                { loading && (<p>Loading Groups</p>) }
                { !loading &&
                    <Form {...form}>
                        <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
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

export default GroupEditPage