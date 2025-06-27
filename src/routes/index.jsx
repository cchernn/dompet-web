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
                        <Layout route="overview" paths={['/']}>
                            <HomePage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions',
            element: <AuthRoute>
                        <Layout route="transactions" paths={['/transactions']}>
                            <TransactionListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/:transaction_id',
            element: <AuthRoute>
                        <Layout route="transactions_edit" paths={['/transactions']}>
                            <TransactionEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/transactions/add',
            element: <AuthRoute>
                        <Layout route="transactions_add" paths={['/transactions']}>
                            <TransactionAddPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/attachments',
            element: <AuthRoute>
                        <Layout route="attachments" paths={['/attachments']}>
                            <AttachmentListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/attachments/:attachment_id',
            element: <AuthRoute>
                        <Layout route="attachments_edit" paths={['/attachments']}>
                            <AttachmentEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/attachments/add',
            element: <AuthRoute>
                        <Layout route="attachments_add" paths={['/attachments']}>
                            <AttachmentAddPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/locations',
            element: <AuthRoute>
                        <Layout route="locations" paths={['/locations']}>
                            <LocationListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/locations/:location_id',
            element: <AuthRoute>
                        <Layout route="locations_edit" paths={['/locations']}>
                            <LocationEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/locations/add',
            element: <AuthRoute>
                        <Layout route="locations_add" paths={['/locations']}>
                            <LocationAddPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/groups',
            element: <AuthRoute>
                        <Layout route="groups" paths={['/groups']}>
                            <GroupListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/groups/:group_id',
            element: <AuthRoute>
                        <Layout route="groups_edit" paths={['/groups']}>
                            <GroupEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/groups/add',
            element: <AuthRoute>
                        <Layout route="groups_add" paths={['/groups']}>
                            <GroupAddPage />
                        </Layout>
                    </AuthRoute>
        },
    ]
    const routes = useRoutes([...publicRoutes, ...authRoutes])
    return routes
}

export default AppRouter