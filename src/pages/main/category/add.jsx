import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { listCategories, createCategory } from "@/api/categories"

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }).max(255, { message: "Name must be less than 255 characters" }),
    parent_id: z.string().nullable().optional(),
})

function CategoryAddPage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", parent_id: null },
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    useEffect(() => {
        listCategories({ pageSize: 100 })
            .then(({ data }) => setCategories(data))
            .catch((error) => toast.error(error.message))
    }, [])

    const onSubmit = async (data) => {
        try {
            await createCategory({ name: data.name, parent_id: data.parent_id || undefined })
            toast.success("Category created")
            navigate("/categories")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onBack = () => navigate(-1)

    const parentOptions = categories.map((category) => ({ value: category.id, label: category.name }))

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>New Category</CardTitle>
                </CardHeader>
                <Form {...form}>
                    <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category Name" {...field} />
                                    </FormControl>
                                    <FormDescription />
                                    <FormMessage>{errors.name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="parent_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Category</FormLabel>
                                    <Combobox
                                        options={parentOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="No parent (root category)"
                                        searchPlaceholder="Search categories"
                                        emptyText="No categories found"
                                    />
                                    <FormDescription />
                                    <FormMessage>{errors.parent_id?.message}</FormMessage>
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

export default CategoryAddPage
