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
import { Skeleton } from "@/components/ui/skeleton"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCachedResource } from "@/hooks/use-cached-resource"
import { useCurrentUserId, isOwnedBy } from "@/hooks/use-current-user-id"
import { listTags, updateTag } from "@/api/tags"
import type { Tag } from "@/api/types"

const formSchema = z.object({
    name: z.string().max(255, { message: "Name must be less than 255 characters" }).optional().or(z.literal("")),
})

function TagEditPage() {
    const { tag_id } = useParams<{ tag_id: string }>()
    const { state } = useLocation() as { state: { tag?: Tag } | null }
    const navigate = useNavigate()
    const { data: tagsData, loading: tagsLoading } = useCachedResource(
        "tags:list:includeInactive",
        () => listTags({ pageSize: 100, includeInactive: true })
    )
    const [tag, setTag] = useState<Tag | null>(state?.tag ?? null)
    const loading = !tag && tagsLoading
    const currentUserId = useCurrentUserId()
    const owned = isOwnedBy(tag?.user_id, currentUserId)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    useEffect(() => {
        if (tag) {
            form.reset({ name: tag.name ?? "" })
            return
        }
        if (tagsLoading) return
        const found = (tagsData ?? []).find((t) => t.id === tag_id)
        setTag(found ?? null)
        if (found) form.reset({ name: found.name ?? "" })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tag, tagsLoading, tag_id])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!data.name || data.name.trim() === "" || data.name === tag?.name) {
            toast.error("Nothing to update")
            return
        }
        try {
            await updateTag(tag_id!, { name: data.name.trim() })
            toast.success("Tag updated")
            navigate("/tags")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const onBack = () => navigate(-1)

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Tag ID: {tag_id}</CardTitle>
                </CardHeader>
                {loading || !tag || currentUserId === undefined ? (
                    <div className="w-full">
                        <Skeleton className="h-6 w-full my-2" />
                        <Skeleton className="h-6 w-full my-2" />
                    </div>
                ) : !owned ? (
                    <p className="text-sm text-muted-foreground">
                        This tag belongs to another user, so it can&apos;t be edited here.
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
                                            <Input placeholder="Tag Name" {...field} />
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
                )}
            </Card>
        </div>
    )
}

export default TagEditPage
