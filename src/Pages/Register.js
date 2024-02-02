import React, { Component } from "react"
import API from "../Services/API"

class Register extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: "",
            email: "",
            first_name: "",
            last_name: "",
            error: ""
        }
    }

    setUsername = (username) => {
        this.setState({ username })
    }

    setPassword = (password) => {
        this.setState({ password })
    }

    setEmail = (email) => {
        this.setState({ email })
    }

    setFirstName = (first_name) => {
        this.setState({ first_name })
    }

    setLastName = (last_name) => {
        this.setState({ last_name })
    }

    handleRegister = async (event) => {
        event.preventDefault()
        
        const payload = {
            username: this.state.username,
            password: this.state.password,
            email: this.state.email,
            first_name: this.state.first_name,
            last_name: this.state.last_name,
        }

        try {
            await API.request(
                'post',
                '/register',
                payload
            )
            .then((res) => {
                if (res.status === 200) {
                    window.location.href = "/login"
                } else {
                    console.log("error", res.response.status, res.message)
                }
            })
        } catch (error) {
            this.setState({ error: `${Object.keys(error)[0]}: ${Object.values(error)[0]}` })
        }
    }

    render() {
        return (
            <section id="register-box" className="container">
                <div className="wrapper-register">
                    <h2>Register</h2>
                    <form>
                        <div className="input-box">
                            <input 
                                type="text"
                                id="username"
                                placeholder="Username"
                                value={this.state.username}
                                onChange={(resp => this.setUsername(resp.target.value))}
                            />
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
                        </div>
                        <div className="input-box">
                            <input 
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={this.state.email}
                                onChange={(resp => this.setEmail(resp.target.value))}
                            />
                        </div>
                        <div className="input-box">
                            <input 
                                type="text"
                                id="first_name"
                                placeholder="First Name"
                                value={this.state.first_name}
                                onChange={(resp => this.setFirstName(resp.target.value))}
                            />
                        </div>
                        <div className="input-box">
                            <input 
                                type="text"
                                id="last_name"
                                placeholder="Last Name"
                                value={this.state.last_name}
                                onChange={(resp => this.setLastName(resp.target.value))}
                            />
                        </div>
                        <button id="register-btn" type="button" onClick={this.handleRegister}>Register</button>
                        {
                            this.state.error && (
                                <div className="error">
                                    <p>Error: {this.state.error}</p>
                                </div>
                            )
                        }
                    </form>
                </div>
            </section>
        )
    }
}

export default Register