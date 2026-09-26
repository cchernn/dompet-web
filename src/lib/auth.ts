import { getCurrentUser } from "aws-amplify/auth"

export const isAuthenticated = async (): Promise<boolean> => {
    try {
        await getCurrentUser()
        return true
    } catch {
        return false
    }
}
