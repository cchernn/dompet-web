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
import authService from "@/lib/authService"

const formSchema = z.object({
    username: z.string()
    .min(1, {message: 'Email must not be empty'})
    .max(32, {message: 'Email must be less than 32 characters'})
    .email({message: 'Invalid email address'}),
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

function SignUpPage() {
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            cpassword: "",
        }
    })

    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data) => {
        try {
            const response = await authService.signUp({
                username: data.username,
                password: data.password,
                attributes: {
                    email: data.username,
                }
            })
            navigate("/confirm", { state: { username: data.username }})
        } catch (error) {
            console.log("SignUp Failed", error)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Sign Up</CardTitle>
                        <CardDescription>
                            Insert email and password to register
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                {/* Username Field */}
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

                                {/* Password Field */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                        <Input type="password" placeholder="Enter Password" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.password?.message}</FormMessage>
                                    </FormItem>
                                    )}
                                />

                                {/* COnfirm Password Field */}
                                <FormField
                                    control={form.control}
                                    name="cpassword"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                        <Input type="password" placeholder="Confirm Password" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.cpassword?.message}</FormMessage>
                                    </FormItem>
                                    )}
                                />

                                <Button className="w-full mt-6 mb-4" type="submit" disabled={isSubmitting}>Sign Up</Button>

                                <div className="text-center text-sm">
                                    Already have an account? {" "}
                                    <a className="underline underline-offset-4 hover:font-bold transition-all duration-300" href="/signin">
                                        Sign in
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

export default SignUpPage