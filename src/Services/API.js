import axios from "axios"

const baseURL = "http://localhost:8000/api"

class API {
    constructor() {
        this.api = axios.create({
            baseURL: baseURL,
            timeout: 1000,
            headers: {
                "Content-Type": "application/json",
            }
        })

        const accessToken = localStorage.getItem('access_token')
        if (accessToken) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        }
    }

    request(method, url, data=null, cred=true) {
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