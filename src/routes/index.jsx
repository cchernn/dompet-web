import { useRoutes } from "react-router-dom"
import SignInPage from "@/pages/auth/signin"
import SignUpPage from "@/pages/auth/signup"
import ConfirmPage from "@/pages/auth/confirm"

function AppRouter() {
    const publicRoutes = [
        {
            path: '/signin',
            element: <LoginPage />
        },
        {
            path: '/signup',
            element: <SignUpPage />
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