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
    username: z.string()
    .min(1, {message: 'Email must not be empty'})
    .email({message: 'Email must be a valid email address'}),
})

function ForgotPasswordPage() {
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        }
    })

    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data: z.infer<typeof formSchema>) => {
        try {
            await authService.resetPassword(data.username)
            navigate("/reset-password", { state: { username: data.username }})
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Forgot Password</CardTitle>
                        <CardDescription>
                            Enter your email and we&apos;ll send a code to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                        <Input type="email" placeholder="Enter Email" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.username?.message}</FormMessage>
                                    </FormItem>
                                    )}
                                />

                                <Button className="w-full mt-6 mb-4" type="submit" disabled={isSubmitting}>Send Code</Button>

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

export default ForgotPasswordPage
