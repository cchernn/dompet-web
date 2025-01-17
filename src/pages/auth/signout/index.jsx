import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import authService from "@/lib/auth"

function SignOutPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const signOut = async () => {
            try {
                await authService.signOut()
            } catch (error) {
                console.error("SignOut Failed", error)
            } finally {
                navigate("/home")
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