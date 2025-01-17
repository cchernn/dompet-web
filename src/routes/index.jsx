import { useRoutes } from "react-router-dom"
import SignInPage from "@/pages/auth/signin"
import SignUpPage from "@/pages/auth/signup"
import SignOutPage from "@/pages/auth/signout"
import ConfirmPage from "@/pages/auth/confirm"

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
    const routes = useRoutes([...publicRoutes])
    return routes
}

export default AppRouter