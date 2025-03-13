import { useRoutes } from "react-router-dom"
import AuthRoute from "@/lib/authRoute"
import Layout from "@/lib/layout"
import {
    ConfirmPage,
    SignInPage,
    SignOutPage,
    SignUpPage, 
} from "@/pages/auth"
import HomePage from "@/pages/main/home"
import  {
    TransactionListPage,
    TransactionEditPage,
    TransactionAddPage,
} from "@/pages/main/transaction"

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
                            <TransactionListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/:transaction_id',
            element: <AuthRoute>
                        <Layout>
                            <TransactionEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/add',
            element: <AuthRoute>
                        <Layout>
                            <TransactionAddPage />
                        </Layout>
                    </AuthRoute>
        },
    ]
    const routes = useRoutes([...publicRoutes, ...authRoutes])
    return routes
}

export default AppRouter