import { Amplify } from 'aws-amplify'
import { signUp, confirmSignUp, signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'
import { get } from "aws-amplify/api"

Amplify.configure({
    Auth: {
        Cognito: {
            region: import.meta.env.VITE_REGION,
            userPoolId: import.meta.env.VITE_COGNITO_USERPOOLID,
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENTID,
        }
    },
    API: {
        REST: {
            dompet: {
                endpoint: import.meta.env.VITE_API_BASE_URL,
                region: import.meta.env.VITE_REGION,
            }
        }
    }
})

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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
            console.log("input", username, code)
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

    fetchData: async (endpoint, method="GET", body=null) => {
        try {
            const session = await fetchAuthSession()
            const token = session.tokens?.accessToken?.toString()

            const options = {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            }

            if (body) {
                options.body = JSON.stringify(body)
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
            return await response.json()
        } catch (error) {
            throw error
        }
    },

    deleteData: async (endpoint, method="DELETE") => {
        try {
            const session = await fetchAuthSession()
            const token = session.tokens?.accessToken?.toString()

            const options = {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
            return await response.json()
        } catch (error) {
            throw error
        }
    } 
}

export default authService