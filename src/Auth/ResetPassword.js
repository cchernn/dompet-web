import React, { Component } from "react"
import { Container, Form, Button } from "react-bootstrap"
import API from "../Services/API"

const baseURL = "http://localhost:8000/api"

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
            <Container>
                <h1>Reset Password</h1>
                <Form>
                    <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="username"
                            placeholder="Enter Username Here"
                            value={this.state.username}
                            onChange={(resp => this.setUsername(resp.target.value))}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter Email Here"
                            value={this.state.email}
                            onChange={(resp => this.setEmail(resp.target.value))}
                        />
                    </Form.Group>
                </Form>
                <Button variant="primary" type="submit" onClick={this.handleResetPassword}>
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

export default ResetPassword