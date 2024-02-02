import React, { Component } from "react"
import { FaUser, FaLock } from "react-icons/fa";
import API from "../Services/API"

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: "",
            error: "",
        }
    }

    setUsername = (username) => {
        this.setState({ username })
    }

    setPassword = (password) => {
        this.setState({ password })
    }

    handleLogin = async () => {
        const payload = {
            username: this.state.username,
            password: this.state.password
        }

        try {
            const { data } = await API.request(
                'post',
                '/token',
                payload
            )
            console.log('data', data)
            localStorage.clear()
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            API.api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
            window.location.href = '/'
        } catch (error) {
            this.setState({ error: "Invalid Credentials" })
        }
    }

    render() {
        return (
            <section id="login-box" className="container">
                <div className="wrapper-login">
                    <h2>Login</h2>
                    <form>
                        <div className="input-box">
                            <input 
                                type="text"
                                id="username"
                                placeholder="Username"
                                value={this.state.username}
                                onChange={(resp => this.setUsername(resp.target.value))}
                            />
                            <FaUser />
                        </div>
                        <div className="input-box">
                            <input 
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={this.state.password}
                                onChange={(resp => this.setPassword(resp.target.value))}
                                autoComplete="on"
                            />
                            <FaLock />
                        </div>
                        <div className="reset-password">
                            <a href="/reset-password">Forgot Password?</a>
                        </div>
                        <button id="login-btn" type="button" onClick={this.handleLogin}>Login</button>
                        {
                            this.state.error && (
                                <div className="error">
                                    <p>Error: {this.state.error}</p>
                                </div>
                            )
                        }
                        <div className="register">
                            <p>Don't have an account? <a href="/register">Register</a> here.</p>
                            
                        </div>
                    </form>
                </div>
            </section>
        )
    }
}

export default Login