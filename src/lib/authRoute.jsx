import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated } from "@/lib/auth"

function AuthRoute({ children }) {
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