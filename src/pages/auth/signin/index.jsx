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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import authService from "@/lib/auth"

const formSchema = z.object({
    username: z.string()
    .min(1, {message: 'Username must be more than 1 character'})
    .max(32, {message: 'Username must be less than 32 characters'}),
    password: z.string()
    .min(8, {message: 'Password must be more than 8 characters'})
    .max(32, {message: 'Password must be less than 32 characters'})
    .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must include at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must include at least one number" })
    .regex(/[@$!%*?&#]/, { message: "Password must include at least one special character (@, $, !, %, *, ?, &, #)" }),
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
            navigate("/home")
        } catch (error) {
            console.log("SignIn Failed", error)
        }
    }
    
    return (
        <>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Username Field */}
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                        <Input placeholder="Enter Username" {...field} />
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
                <Button type="submit" disabled={isSubmitting}>Sign Up</Button>
            </form>
        </Form>
        </>
    )
}

export default SignInPage