import { useRoutes } from "react-router-dom"
import AuthRoute from "@/lib/authRoute"
import SignInPage from "@/pages/auth/signin"
import SignUpPage from "@/pages/auth/signup"
import SignOutPage from "@/pages/auth/signout"
import ConfirmPage from "@/pages/auth/confirm"
import HomePage from "@/pages/main/home"

function AppRouter() {
    const publicRoutes = [
        {
            path: '/signin',
            element: <SignInPage />
        },
        {
            path: '/signup',
            element: <SignUpPage />
        },
        {
            path: '/signout',
            element: <SignOutPage />
        },
        {
            path: '/confirm',
            element: <ConfirmPage />
        }
    ]
    const authRoutes = [
        {
            path: '/',
            element: <AuthRoute>
                        <HomePage />
                    </AuthRoute>
        }
    ]
    const routes = useRoutes([...publicRoutes, ...authRoutes])
    return routes
}

export default AppRouter