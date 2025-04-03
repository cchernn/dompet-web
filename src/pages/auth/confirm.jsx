import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Verify Email</CardTitle>
                        <CardDescription>
                            Please check email and insert verification code.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
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

                        <Button className="w-full mt-6 mb-4" type="submit" onClick={onSubmit}>Submit</Button>
                        
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ConfirmPage