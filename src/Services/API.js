import axios from "axios"

class API {
    constructor() {
        this.api = axios.create({
            baseURL: process.env.REACT_APP_API_BASE_URL,
            timeout: 5000,
            headers: {
                "Content-Type": "application/json",
            }
        })

        this.api.interceptors.request.use(
            (config) => {
                const accessToken = localStorage.getItem('access_token')
                if (accessToken) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`
                }
                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        this.api.interceptors.response.use(
            (response) => {
                return response
            },
            (error) => {
                if (error.response.status === 401) {
                    localStorage.clear()
                    delete this.api.defaults.headers.common['Authorization']
                    if (error.response.data.detail !== "No active account found with the given credentials") {
                        window.location.href = "/"
                    }
                } else {
                    return Promise.reject(error)
                }
            }
        )
    }

    async request(method, url, data=null, cred=true) {
        return this.api({
            method: method,
            url: url,
            data: data,
            withCredentials: cred 
        })
        .then(response => response)
        .catch(error => {
            throw error.response ? error.response.data : error
        })
    }
}

const apiInstance = new API()

export default apiInstance