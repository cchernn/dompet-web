import React, { Component } from "react"
import { useSearchParams } from "react-router-dom"
import API from "../Services/API"

class ResetPasswordConfirmClass extends Component {
    constructor(props) {
        super(props)
        this.state = {
            newPassword: "",
            newPasswordConfirm: "",
            error: "",
            resMessage: ""
        }
    }

    setPassword = (newPassword) => {
        this.setState({ newPassword })
    }

    setPasswordConfirm = (newPasswordConfirm) => {
        this.setState({ newPasswordConfirm })
    }

    handleResetPassword = async (token) => {
        const payload = {
            password: this.state.newPassword,
            token: token
        }

        // Validation for newPassword and newPasswordConfirm
        if (!this.state.newPassword || !this.state.newPasswordConfirm) {
            this.setState({
                error: "Passwords are required fields"
            })
            return 
        }

        // Validation for newPassword and newPasswordConfirm to be equivalent
        if (this.state.newPassword !== this.state.newPasswordConfirm) {
            this.setState({
                error: "Password confirmation is not equal to Password. Try again."
            })
            return 
        }

        try {
            await API.request(
                "post",
                "/password_reset/confirm/",
                payload
            )
            this.setState({
                resMessage: "Password has been reset. Please proceed to login with your new credentials.",
                error: ""
            })
            window.location.href = "/login"
        } catch (error) {
            this.setState({ error: "Password reset failed. Please go through the reset password request and try again." })
        } finally {
            this.setState({
                newPassword: "",
                newPasswordConfirm: "",
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
                            <input 
                                type="password"
                                id="new_password"
                                placeholder="New Password"
                                value={this.state.newPassword}
                                onChange={(resp => this.setPassword(resp.target.value))}
                                autoComplete="on"
                            />
                        </div>
                        <div className="input-box">
                            <input 
                                type="password"
                                id="new_password_confirm"
                                placeholder="Confirm New Password"
                                value={this.state.newPasswordConfirm}
                                onChange={(resp => this.setPasswordConfirm(resp.target.value))}
                                autoComplete="on"
                            />
                        </div>
                    </form>
                    <button id="reset-password-btn" type="button" onClick={() => this.handleResetPassword(this.props.token)}>Reset Password</button>
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
                </div>
            </section>
        )
    }
}

const ResetPasswordConfirm = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    return (
      <div>
        <ResetPasswordConfirmClass token={token} />
      </div>
    );
  };

export default ResetPasswordConfirm