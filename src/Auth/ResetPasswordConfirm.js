import React, { Component } from "react"
import { Container, Form, Button } from "react-bootstrap"
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
            <Container>
                <h1>Reset Password</h1>
                <Form>
                    <Form.Group>
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter New Password Here"
                            value={this.state.newPassword}
                            onChange={(resp => this.setPassword(resp.target.value))}
                            autoComplete="on"
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter New Password Here"
                            value={this.state.newPasswordConfirm}
                            onChange={(resp => this.setPasswordConfirm(resp.target.value))}
                            autoComplete="on"
                        />
                    </Form.Group>
                </Form>
                <Button variant="primary" type="submit" onClick={() => this.handleResetPassword(this.props.token)}>
                    Reset Password
                </Button>
                {
                    this.state.error && (
                        <div className="text-danger">{this.state.error}</div>
                    )
                }
                {
                    this.state.resMessage && (
                        <div className="text-primary">{this.state.resMessage}</div>
                    )
                }
            </Container>
        )
    }
}

const ResetPasswordConfirm = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    return (
      <Container>
        <ResetPasswordConfirmClass token={token} />
      </Container>
    );
  };

export default ResetPasswordConfirm