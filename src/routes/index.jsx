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
import {
    AttachmentListPage,
    AttachmentEditPage,
    AttachmentAddPage,
} from "@/pages/main/attachment"
import {
    LocationListPage,
    LocationEditPage,
    LocationAddPage,
} from "@/pages/main/location"
import {
    GroupListPage,
    GroupEditPage,
    GroupAddPage,
} from "@/pages/main/group"

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
                        <Layout route="overview">
                            <HomePage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions',
            element: <AuthRoute>
                        <Layout route="transactions">
                            <TransactionListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/:transaction_id',
            element: <AuthRoute>
                        <Layout route="transactions_edit">
                            <TransactionEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/add',
            element: <AuthRoute>
                        <Layout route="transactions_add">
                            <TransactionAddPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/attachments',
            element: <AuthRoute>
                        <Layout route="attachments">
                            <AttachmentListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/attachments/:attachment_id',
            element: <AuthRoute>
                        <Layout route="attachments_edit">
                            <AttachmentEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/attachments/add',
            element: <AuthRoute>
                        <Layout route="attachments_add">
                            <AttachmentAddPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/locations',
            element: <AuthRoute>
                        <Layout route="locations">
                            <LocationListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/locations/:location_id',
            element: <AuthRoute>
                        <Layout route="locations_edit">
                            <LocationEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/locations/add',
            element: <AuthRoute>
                        <Layout route="locations_add">
                            <LocationAddPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/groups',
            element: <AuthRoute>
                        <Layout route="groups">
                            <GroupListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/groups/:group_id',
            element: <AuthRoute>
                        <Layout route="groups_edit">
                            <GroupEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/groups/add',
            element: <AuthRoute>
                        <Layout route="groups_add">
                            <GroupAddPage />
                        </Layout>
                    </AuthRoute>
        },
    ]
    const routes = useRoutes([...publicRoutes, ...authRoutes])
    return routes
}

export default AppRouter