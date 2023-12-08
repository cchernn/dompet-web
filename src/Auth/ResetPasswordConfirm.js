import React, { Component } from "react"
import { Container, Form, Button } from "react-bootstrap"
import { useSearchParams } from "react-router-dom"
import API from "../Services/API"

class ResetPasswordConfirmClass extends Component {
    constructor(props) {
        super(props)
        this.state = {
            new_password: "",
            new_password_confirm: "",
            error: "",
            resMessage: ""
        }
    }

    setPassword = (new_password) => {
        this.setState({ new_password })
    }

    setPasswordConfirm = (new_password_confirm) => {
        this.setState({ new_password_confirm })
    }

    handleResetPassword = async (token) => {
        const payload = {
            password: this.state.new_password,
            token: token
        }

        // Validation for new_password and new_password_confirm
        if (!this.state.new_password || !this.state.new_password_confirm) {
            this.setState({
                error: "Passwords are required fields"
            })
            return 
        }

        // Validation for new_password and new_password_confirm to be equivalent
        if (this.state.new_password !== this.state.new_password_confirm) {
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
                new_password: "",
                new_password_confirm: "",
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
                            value={this.state.new_password}
                            onChange={(resp => this.setPassword(resp.target.value))}
                            autoComplete="on"
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter New Password Here"
                            value={this.state.new_password_confirm}
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