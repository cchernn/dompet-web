import { useNavigate, useLocation } from "react-router-dom"
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
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/lib/toast"
import authService from "@/lib/authService"

const formSchema = z.object({
    code: z.string()
    .min(1, {message: 'Code must not be empty'}),
    password: z.string()
    .min(8, {message: 'Password must be more than 8 characters'})
    .max(32, {message: 'Password must be less than 32 characters'})
    .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must include at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must include at least one number" })
    .regex(/[@$!%*?&#]/, { message: "Password must include at least one special character (@, $, !, %, *, ?, &, #)" }),
    cpassword: z.string()
}).refine(
    (data) => data.password === data.cpassword,
    {message: 'Passwords must match', path: ['cpassword']}
)

function ResetPasswordPage() {
    const navigate = useNavigate()
    const location = useLocation() as { state: { username?: string } | null }

    const username = location.state?.username

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            password: "",
            cpassword: "",
        }
    })

    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data: z.infer<typeof formSchema>) => {
        try {
            await authService.confirmResetPassword({
                username: username!,
                code: data.code,
                newPassword: data.password,
            })
            toast.success("Password reset — please sign in.")
            navigate("/signin")
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>
                            Enter the code we sent you and choose a new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                        <Input type="text" placeholder="Enter Code" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.code?.message}</FormMessage>
                                    </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                        <Input type="password" placeholder="Enter New Password" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.password?.message}</FormMessage>
                                    </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cpassword"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                        <Input type="password" placeholder="Confirm New Password" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.cpassword?.message}</FormMessage>
                                    </FormItem>
                                    )}
                                />

                                <Button className="w-full mt-6 mb-4" type="submit" disabled={isSubmitting}>Reset Password</Button>

                                <div className="text-center text-sm">
                                    <a className="underline underline-offset-4 hover:font-bold transition-all duration-300" href="/signin">
                                        Back to Sign In
                                    </a>
                                </div>

                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ResetPasswordPage
