import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { format } from "date-fns"
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
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LoadingState } from "@/components/loading-state"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/lib/toast"
import { ApiError } from "@/lib/apiClient"
import { getMe, createProfile, updateProfile, ALLOWED_AVATAR_CONTENT_TYPES } from "@/api/users"
import type { User } from "@/api/types"

// Matches the backend's USERNAME_RE (app/db/user.py) exactly.
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/

const formSchema = z.object({
    username: z.string().regex(USERNAME_RE, {
        message: "3-30 characters: letters, numbers, and underscores only",
    }),
    display_name: z.string().max(100, { message: "Display name must be less than 100 characters" }).optional().or(z.literal("")),
})

function ProfilePage() {
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarError, setAvatarError] = useState("")
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", display_name: "" },
    })

    const {
        formState: { errors, isSubmitting },
    } = form

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getMe()
                setProfile(data)
                form.reset({ username: data.username, display_name: data.display_name ?? "" })
            } catch (error) {
                // A 404 here just means this account hasn't created a profile
                // yet — that's the "show the create form" state, not an error.
                if (!(error instanceof ApiError && error.status === 404)) {
                    toast.error((error as Error).message)
                }
            } finally {
                setLoading(false)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Local preview for a newly-picked (not-yet-uploaded) file — revoked
    // whenever it's replaced or cleared, including on unmount.
    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreviewUrl(null)
            return
        }
        const url = URL.createObjectURL(avatarFile)
        setAvatarPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [avatarFile])

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null
        event.target.value = ""
        if (!file) return
        if (!ALLOWED_AVATAR_CONTENT_TYPES.includes(file.type)) {
            setAvatarError("Avatar must be a PNG, JPEG, WEBP, or GIF image.")
            return
        }
        setAvatarError("")
        setAvatarFile(file)
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            if (!profile) {
                const created = await createProfile(
                    { username: data.username, display_name: data.display_name || undefined },
                    avatarFile
                )
                setProfile(created)
                setAvatarFile(null)
                toast.success("Profile created.")
                return
            }

            const patch: { username?: string; display_name?: string | null } = {}
            if (data.username !== profile.username) patch.username = data.username
            if ((data.display_name || null) !== (profile.display_name ?? null)) {
                patch.display_name = data.display_name || null
            }
            if (Object.keys(patch).length === 0 && !avatarFile) {
                toast.success("No changes to save.")
                return
            }

            const updated = await updateProfile(patch, avatarFile)
            setProfile(updated)
            setAvatarFile(null)
            toast.success("Profile updated.")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2 items-center justify-center">
            <Card className="flex flex-col p-6 rounded-2xl shadow-md border items-start justify-start w-full max-w-screen-md">
                <CardHeader className="pt-0 pb-4">
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        Your username is how other dompet users see you — e.g. when you&apos;re added as a shared budget
                        member, or shown as the owner of a transaction in one. It&apos;s separate from your sign-in email.
                    </CardDescription>
                </CardHeader>
                {loading ? (
                    <LoadingState />
                ) : (
                    <>
                        {!profile && (
                            <p className="text-sm text-muted-foreground mb-4">
                                You haven&apos;t set up a profile yet. Pick a username below to get started.
                            </p>
                        )}
                        {profile && (
                            <p className="text-sm text-muted-foreground mb-4">
                                Member since {format(new Date(profile.created_at), "d MMM yyyy")}.
                            </p>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={avatarPreviewUrl ?? profile?.avatar_url ?? undefined} />
                                <AvatarFallback className="text-lg">
                                    {profile?.username ? profile.username[0].toUpperCase() : "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ALLOWED_AVATAR_CONTENT_TYPES.join(",")}
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    {profile?.avatar_url || avatarFile ? "Change Photo" : "Upload Photo"}
                                </Button>
                                {avatarError && <p className="text-sm font-medium text-destructive">{avatarError}</p>}
                            </div>
                        </div>

                        <Form {...form}>
                            <form className="w-full max-w-sm flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. jane_doe" {...field} />
                                            </FormControl>
                                            <FormDescription>Letters, numbers, and underscores only. 3-30 characters.</FormDescription>
                                            <FormMessage>{errors.username?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="display_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormDescription>Shown instead of your username where there&apos;s room for it, if set.</FormDescription>
                                            <FormMessage>{errors.display_name?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isSubmitting} className="w-full max-w-xs">
                                    {profile ? "Save" : "Create Profile"}
                                </Button>
                            </form>
                        </Form>
                    </>
                )}
            </Card>
        </div>
    )
}

export default ProfilePage
