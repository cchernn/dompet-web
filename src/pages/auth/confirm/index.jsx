import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import authService from "@/lib/authService"

function ConfirmPage() {
    const [passkey, setPasskey] = useState("")
    const navigate = useNavigate()
    const location = useLocation()

    const username = location.state?.username
    console.log(username)

    const onSubmit = async (data) => {
        try {
            console.log("payload", username, passkey)
            const response = await authService.confirmSignUp({
                username: username,
                code: passkey,
            })
            console.log("Success", response)
        } catch (error) {
            console.log("SignUp Failed", error)
        }
        navigate("/login")
    }
    
    const onBack = () => {
        navigate(-1)
    }

    return (
        <>
        <InputOTP 
            maxLength={6}
            value={passkey}
            onChange={(value) => setPasskey(value)}
        >
            <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
        </InputOTPGroup>
        </InputOTP>
        <Button type="submit" onClick={onSubmit}>Submit</Button>
        <Button type="submit" onClick={onBack}>Back</Button>
        </>
    )
}

export default ConfirmPage