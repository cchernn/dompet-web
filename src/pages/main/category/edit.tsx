import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "@/lib/toast"
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
import { LoadingState } from "@/components/loading-state"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { useCurrentUserId, isOwnedBy } from "@/hooks/use-current-user-id"
import { listCategories, updateCategory } from "@/api/categories"
import type { Category, CategoryPatch } from "@/api/types"

const formSchema = z.object({
    name: z.string().max(255, { message: "Name must be less than 255 characters" }).optional().or(z.literal("")),
    parent_id: z.string().nullable().optional(),
})

// Computes every descendant id of `rootId` given the full category list, so
// the parent Combobox can refuse to offer them — the backend only rejects a
// category being re-parented to itself directly, not a multi-level cycle.
function collectDescendantIds(categories: Category[], rootId: string): string[] {
    const childrenByParent = new Map<string, string[]>()
    for (const category of categories) {
        if (!category.parent_id) continue
        const siblings = childrenByParent.get(category.parent_id) ?? []
        siblings.push(category.id)
        childrenByParent.set(category.parent_id, siblings)
    }

    const descendants: string[] = []
    const queue = [...(childrenByParent.get(rootId) ?? [])]
    while (queue.length > 0) {
        const id = queue.shift()!
        descendants.push(id)
        queue.push(...(childrenByParent.get(id) ?? []))
    }
    return descendants
}

function CategoryEditPage() {
    const { category_id } = useParams<{ category_id: string }>()
    const { state } = useLocation() as { state: { category?: Category } | null }
    const navigate = useNavigate()
    const { data: categoriesData, loading: categoriesLoading } = useCachedResource(
        "categories:list:includeInactive",
        () => listCategories({ pageSize: 100, includeInactive: true })
    )
    const categories = categoriesData ?? []
    const [category, setCategory] = useState<Category | null>(state?.category ?? null)
    const loading = !category && categoriesLoading
    const currentUserId = useCurrentUserId()
    const owned = isOwnedBy(category?.user_id, currentUserId)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    useEffect(() => {
        if (category || categoriesLoading) return
        const found = categories.find((c) => c.id === category_id)
        setCategory(found ?? null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriesLoading, category_id])

    useEffect(() => {
        if (category) {
            form.reset({ name: category.name ?? "", parent_id: category.parent_id ?? null })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const patch: CategoryPatch = {}
        if (data.name && data.name.trim() !== "" && data.name !== category?.name) {
            patch.name = data.name.trim()
        }
        patch.parent_id = data.parent_id || null

        try {
            await updateCategory(category_id!, patch)
            toast.success("Category updated")
            navigate("/categories")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => navigate(-1)

    const excludeValues = category ? [category.id, ...collectDescendantIds(categories, category.id)] : []
    const parentOptions: ComboboxOption[] = categories.map((c) => ({ value: c.id, label: c.name }))

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Category ID: {category_id}</CardTitle>
                </CardHeader>
                {loading || !category || currentUserId === undefined ? (
                    <LoadingState />
                ) : !owned ? (
                    <p className="text-sm text-muted-foreground">
                        This category is shared or belongs to another user, so it can&apos;t be edited here.
                    </p>
                ) : (
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
                                            excludeValues={excludeValues}
                                            placeholder="No parent (root category)"
                                            searchPlaceholder="Search categories"
                                            emptyText="No categories found"
                                        />
                                        <FormDescription>
                                            A category can&apos;t be re-parented under itself or one of its own subcategories.
                                        </FormDescription>
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
                )}
            </Card>
        </div>
    )
}

export default CategoryEditPage
