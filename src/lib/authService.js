import { Amplify } from 'aws-amplify'
import { signUp, confirmSignUp, signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'

Amplify.configure({
    Auth: {
        Cognito: {
            region: import.meta.env.VITE_REGION,
            userPoolId: import.meta.env.VITE_COGNITO_USERPOOLID,
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENTID,
        }
    }
})

const authService = {
    signUp: async ({username, password, attributes}) => {
        try {
            const response = await signUp({
                username,
                password,
                attributes
            })
            return response
        } catch (error) {
            throw error
        }
    },

    confirmSignUp: async ({username, code}) => {
        try {
            const response = await confirmSignUp({
                username: username,
                confirmationCode: code
            })
            return response
        } catch (error) {
            throw error
        }
    },

    signIn: async (username, password) => {
        try {
            const response = await signIn(username, password)
            return response
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
            const user = session.userSub?.toString()
            return user
        } catch (error) {
            throw error
        }
    },
}

export default authService
