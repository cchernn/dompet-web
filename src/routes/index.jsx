import { useRoutes } from "react-router-dom"
import AuthRoute from "@/lib/authRoute"
import Layout from "@/lib/layout"
import SignInPage from "@/pages/auth/signin"
import SignUpPage from "@/pages/auth/signup"
import SignOutPage from "@/pages/auth/signout"
import ConfirmPage from "@/pages/auth/confirm"
import HomePage from "@/pages/main/home"
import TransactionsPage from "@/pages/main/transactions"

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
                        <Layout>
                            <HomePage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions',
            element: <AuthRoute>
                        <Layout>
                            <TransactionsPage />
                        </Layout>
                    </AuthRoute>
        },
    ]
    const routes = useRoutes([...publicRoutes, ...authRoutes])
    return routes
}

export default AppRouter