import { Amplify } from 'aws-amplify'
import { signUp, confirmSignUp, signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'

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

    fetchData: async (endpoint, params=null, body=null, method="GET") => {
        try {
            const session = await fetchAuthSession()
            const token = session.tokens?.accessToken?.toString()
            const options = {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                ...(body ? {body: JSON.stringify(body) } : {})
            }
            let url = `${API_BASE_URL}${endpoint}`
            if (params) {
                const queryString = new URLSearchParams(params).toString()
                url += `?${queryString}`
            }

            const response = await fetch(url, options)
            return await response.json()
        } catch (error) {
            throw error
        }
    },

    addData: async (endpoint, body=null, method="POST") => {
        try {
            const session = await fetchAuthSession()
            const token = session.tokens?.accessToken?.toString()
            const options = {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                ...(body ? {body: JSON.stringify(body) } : {})
            }
            let url = `${API_BASE_URL}${endpoint}`

            const response = await fetch(url, options)
            return await response.json()
        } catch (error) {
            throw error
        }
    },

    editData: async (endpoint, body=null, method="PUT") => {
        try {
            const session = await fetchAuthSession()
            const token = session.tokens?.accessToken?.toString()
            const options = {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                ...(body ? {body: JSON.stringify(body) } : {})
            }
            let url = `${API_BASE_URL}${endpoint}`

            const response = await fetch(url, options)
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
            let url = `${API_BASE_URL}${endpoint}`

            const response = await fetch(url, options)
            return await response.json()
        } catch (error) {
            throw error
        }
    } 
}

export default authService