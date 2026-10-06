import { Amplify } from "aws-amplify"
import {
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    fetchAuthSession,
} from "aws-amplify/auth"

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_COGNITO_USERPOOLID,
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENTID,
        },
    },
})

interface SignUpParams {
    username: string
    password: string
    attributes: Record<string, string>
}

interface ConfirmSignUpParams {
    username: string
    code: string
}

interface SignInParams {
    username: string
    password: string
}

const authService = {
    signUp: async ({ username, password, attributes }: SignUpParams) => {
        try {
            return await signUp({
                username,
                password,
                options: { userAttributes: attributes },
            })
        } catch (error) {
            throw error
        }
    },

    confirmSignUp: async ({ username, code }: ConfirmSignUpParams) => {
        try {
            return await confirmSignUp({
                username,
                confirmationCode: code,
            })
        } catch (error) {
            throw error
        }
    },

    signIn: async ({ username, password }: SignInParams) => {
        try {
            return await signIn({ username, password })
        } catch (error) {
            throw error
        }
    },

    signOut: async () => {
        try {
            await signOut()
        } catch (error) {
            throw error
        }
    },

    getUser: async () => {
        try {
            const session = await fetchAuthSession()
            return session.userSub?.toString()
        } catch (error) {
            throw error
        }
    },
}

export default authService
