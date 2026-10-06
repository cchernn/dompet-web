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
import {
    TransactionListPage,
    TransactionEditPage,
    TransactionAddPage,
} from "@/pages/main/transaction"
import {
    AccountListPage,
    AccountEditPage,
    AccountAddPage,
} from "@/pages/main/account"
import {
    CategoryListPage,
    CategoryEditPage,
    CategoryAddPage,
} from "@/pages/main/category"
import {
    LocationListPage,
    LocationEditPage,
    LocationAddPage,
} from "@/pages/main/location"
import {
    TagListPage,
    TagEditPage,
    TagAddPage,
} from "@/pages/main/tag"
import {
    AttachmentListPage,
    AttachmentEditPage,
    AttachmentAddPage,
} from "@/pages/main/attachment"
import {
    BudgetListPage,
    BudgetEditPage,
    BudgetAddPage,
} from "@/pages/main/budget"

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
            path: '/accounts',
            element: <AuthRoute>
                        <Layout route="accounts" paths={['/accounts']}>
                            <AccountListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/accounts/:account_id',
            element: <AuthRoute>
                        <Layout route="accounts_edit" paths={['/accounts']}>
                            <AccountEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/accounts/add',
            element: <AuthRoute>
                        <Layout route="accounts_add" paths={['/accounts']}>
                            <AccountAddPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/categories',
            element: <AuthRoute>
                        <Layout route="categories" paths={['/categories']}>
                            <CategoryListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/categories/:category_id',
            element: <AuthRoute>
                        <Layout route="categories_edit" paths={['/categories']}>
                            <CategoryEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/categories/add',
            element: <AuthRoute>
                        <Layout route="categories_add" paths={['/categories']}>
                            <CategoryAddPage />
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
            path: '/tags',
            element: <AuthRoute>
                        <Layout route="tags" paths={['/tags']}>
                            <TagListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/tags/:tag_id',
            element: <AuthRoute>
                        <Layout route="tags_edit" paths={['/tags']}>
                            <TagEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/tags/add',
            element: <AuthRoute>
                        <Layout route="tags_add" paths={['/tags']}>
                            <TagAddPage />
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
            path: '/budgets',
            element: <AuthRoute>
                        <Layout route="budgets" paths={['/budgets']}>
                            <BudgetListPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/budgets/:budget_id',
            element: <AuthRoute>
                        <Layout route="budgets_edit" paths={['/budgets']}>
                            <BudgetEditPage />
                        </Layout>
                    </AuthRoute>
        },
        {
            path: '/budgets/add',
            element: <AuthRoute>
                        <Layout route="budgets_add" paths={['/budgets']}>
                            <BudgetAddPage />
                        </Layout>
                    </AuthRoute>
        },
    ]
    const routes = useRoutes([...publicRoutes, ...authRoutes])
    return routes
}

export default AppRouter
