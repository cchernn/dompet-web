import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import authService from "@/lib/authService"
import { clearResourceCache } from "@/lib/resourceCache"

function SignOutPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const signOut = async () => {
            try {
                await authService.signOut()
            } catch (error) {
                console.error("SignOut Failed", error)
            } finally {
                clearResourceCache()
                navigate("/signin")
            }
        }
        signOut()
    }, [navigate])

    return (
        <>
        </>
    )
}

export default SignOutPage
