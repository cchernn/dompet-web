import { useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated } from "@/lib/auth"

interface AuthRouteProps {
    children: ReactNode
}

function AuthRoute({ children }: AuthRouteProps) {
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            const isSignedIn = await isAuthenticated()
            if (!isSignedIn) {
                navigate("/signin")
            }
        }
        checkAuth()
    }, [navigate])

    return <>{ children }</>
}

export default AuthRoute
