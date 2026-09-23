import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Ban, RotateCcw, X } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import Alert from "@/lib/alertDialog"
import {
    getAccount,
    updateAccount,
    deactivateAccount,
    reactivateAccount,
} from "@/api/accounts"
import { listAccountLocations, linkLocation, unlinkLocation } from "@/api/accountLocations"
import { listLocations } from "@/api/locations"

const formSchema = z.object({
    code: z.string()
        .min(1, { message: "Code is required" })
        .max(100, { message: "Code must be less than 100 characters" }),
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be less than 255 characters" }),
    description: z.string().optional(),
})

function AccountEditPage() {
    const { account_id } = useParams()
    const navigate = useNavigate()
    const [account, setAccount] = useState(null)
    const [loading, setLoading] = useState(true)
    const [linkedLocations, setLinkedLocations] = useState([])
    const [allLocations, setAllLocations] = useState([])
    const [selectedLocationId, setSelectedLocationId] = useState("")

    const form = useForm({
        resolver: zodResolver(formSchema),
    })

    const {
        formState: { errors, isSubmitting }
    } = form

    useEffect(() => {
        fetchAccount()
        fetchLinkedLocations()
        fetchAllLocations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account_id])

    async function fetchAccount() {
        try {
            const { data } = await getAccount(account_id)
            setAccount(data)
            form.reset({
                code: data.code ?? "",
                name: data.name ?? "",
                description: data.description ?? "",
            })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function fetchLinkedLocations() {
        try {
            const { data } = await listAccountLocations(account_id, { pageSize: 100 })
            setLinkedLocations(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    async function fetchAllLocations() {
        try {
            const { data } = await listLocations({ pageSize: 100 })
            setAllLocations(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onSubmit = async (data) => {
        // Only send fields the user actually changed to a non-blank value —
        // the backend's edit endpoint doesn't re-validate non-empty like create does.
        const patch = {}
        if (data.code && data.code !== account.code) patch.code = data.code
        if (data.name && data.name !== account.name) patch.name = data.name
        if (data.description !== undefined && data.description !== account.description) {
            patch.description = data.description || undefined
        }
        if (Object.keys(patch).length === 0) {
            toast.success("No changes to save.")
            return
        }
        try {
            await updateAccount(account_id, patch)
            toast.success("Account updated.")
            navigate(`/accounts`)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onBack = () => {
        navigate(-1)
    }

    const handleDeactivate = async () => {
        try {
            await deactivateAccount(account_id)
            toast.success("Account deactivated.")
            fetchAccount()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleReactivate = async () => {
        try {
            await reactivateAccount(account_id)
            toast.success("Account reactivated.")
            fetchAccount()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleLink = async () => {
        if (!selectedLocationId) return
        try {
            await linkLocation(account_id, selectedLocationId)
            setSelectedLocationId("")
            fetchLinkedLocations()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleUnlink = async (locationId) => {
        try {
            await unlinkLocation(account_id, locationId)
            fetchLinkedLocations()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const linkedIds = new Set(linkedLocations.map((location) => location.id))
    const locationOptions = allLocations.map((location) => ({ value: location.id, label: location.name }))

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start">
                <CardHeader className="pt-0 pb-4 w-full flex flex-row items-center justify-between">
                    <CardTitle>Account: {account_id}</CardTitle>
                    {account && (
                        account.is_active ? (
                            <Alert
                                button_text={<><Ban />Deactivate</>}
                                title="Confirm Deactivate"
                                description="This account will be marked inactive. You can reactivate it later."
                                action={handleDeactivate}
                            />
                        ) : (
                            <Alert
                                button_text={<><RotateCcw />Reactivate</>}
                                title="Confirm Reactivate"
                                description="This account will be marked active again."
                                action={handleReactivate}
                            />
                        )
                    )}
                </CardHeader>
                {
                    loading ?
                        <div className="w-full">
                            <Skeleton className="h-6 w-full my-2" />
                            <Skeleton className="h-6 w-full my-2" />
                        </div>
                    :
                    <Form {...form}>
                        <form className="w-full max-w-screen-md flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                            {/* Code Field */}
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Account Code" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.code?.message}</FormMessage>
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
                                            <Input placeholder="Account Name" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.name?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Description Field */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Account Description" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.description?.message}</FormMessage>
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

                {/* Locations sub-section */}
                {!loading && (
                    <div className="w-full max-w-screen-md mt-8 pt-6 border-t flex flex-col gap-3">
                        <h3 className="font-semibold">Linked Locations</h3>
                        <div className="flex flex-wrap gap-2">
                            {linkedLocations.length === 0 && (
                                <span className="text-sm text-muted-foreground">No locations linked yet.</span>
                            )}
                            {linkedLocations.map((location) => (
                                <Badge key={location.id} className="inline-flex items-center gap-2 px-2 py-1">
                                    {location.name}
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => handleUnlink(location.id)}
                                    >
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 items-center max-w-md">
                            <Combobox
                                options={locationOptions}
                                value={selectedLocationId}
                                onChange={setSelectedLocationId}
                                excludeValues={[...linkedIds]}
                                placeholder="Select a location to link"
                                searchPlaceholder="Search locations"
                                emptyText="No locations found."
                            />
                            <Button type="button" onClick={handleLink} disabled={!selectedLocationId}>Link</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AccountEditPage
