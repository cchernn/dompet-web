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
    .email({message: 'Email must be a valid email address'}),
    password: z.string()
    .min(1, {message: 'Password must not be empty'})
})

function SignInPage() {
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        }
    })

    const {
        formState: {errors, isSubmitting}
    } = form

    const onSubmit = async(data) => {
        try {
            const response = await authService.signIn({
                username: data.username,
                password: data.password,
            })
            console.log("Success", response)
            navigate("/")
        } catch (error) {
            console.log("SignIn Failed", error)
        }
    }
    
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Sign In</CardTitle>
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
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Password</FormLabel>
                                            <a className="text-sm hover:underline hover:font-bold transition-all duration-300" href="#">Forgot Password?</a>
                                        </div>
                                        <FormControl>
                                        <Input type="password" placeholder="Enter Password" {...field} />
                                        </FormControl>
                                        <FormDescription />
                                        <FormMessage>{errors.password?.message}</FormMessage>
                                    </FormItem>
                                    )}
                                />
                                
                                <Button className="w-full mt-6 mb-4" type="submit" disabled={isSubmitting}>Sign In</Button>

                                <div className="text-center text-sm">
                                    Don't have an account? {" "}
                                    <a className="underline underline-offset-4 hover:font-bold transition-all duration-300" href="/signup">
                                        Sign up
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

export default SignInPage