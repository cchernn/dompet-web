import React, { Component } from "react"
import API from "../Services/API"

class ResetPassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: "",
            email: "",
            error: "",
            resMessage: ""
        }
    }

    setUsername = (username) => {
        this.setState({ username })
    }

    setEmail = (email) => {
        this.setState({ email })
    }

    handleResetPassword = async () => {
        const payload = {
            username: this.state.username,
            email: this.state.email
        }

        try {
            const resp = await API.request(
                "post",
                "/verify-email",
                payload
            )
            if (resp.status === 200) {
                await API.request(
                    "post",
                    "/password_reset/",
                    payload
                )
            }

            this.setState({
                resMessage: "Password Reset Email has been sent. Please check your email to reset password.",
                error: ""
            })
        } catch (error) {
            if (error.detail) {
                this.setState({ error: error.detail })
            } else {
                this.setState({ error: "Email failed to send. Sorry, please try again later." })
            }
        } finally {
            this.setState({
                username: "",
                email: "",
            })
        }
    }

    render() {
        return (
            <section id="reset-password-box" className="container">
                <div className="wrapper-reset-password">
                    <h2>Reset Password</h2>
                    <form>
                        <div className="input-box">
                            {/* <label>Username</label> */}
                            <input 
                                type="text"
                                id="username"
                                placeholder="Username"
                                value={this.state.username}
                                onChange={(resp => this.setUsername(resp.target.value))}
                            />
                        </div>
                        <div className="input-box">
                            {/* <label>Email</label> */}
                            <input 
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={this.state.email}
                                onChange={(resp => this.setEmail(resp.target.value))}
                            />
                        </div>
                        <button id="reset-password-btn" type="button" onClick={this.handleResetPassword}>Reset Password</button>
                        {
                            this.state.error && (
                                <div>{this.state.error}</div>
                            )
                        }
                        {
                            this.state.resMessage && (
                                <div>{this.state.resMessage}</div>
                            )
                        }
                    </form>
                </div>
            </section>
        )
    }
}

export default ResetPassword