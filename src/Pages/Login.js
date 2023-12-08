import React, { Component } from "react"
import { Container, Form, Button } from "react-bootstrap"
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

            localStorage.clear()
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            API.api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
            window.location.href = '/'
        } catch (error) {
            this.setState({ error: "Invalid Credentials" })
        }
    }

    handleResetPassword = () => {
        window.location.href = "/reset-password"
    }

    render() {
        return (
            <Container>
                <h1>Login</h1>
                <Form>
                    <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Username Here"
                            value={this.state.username}
                            onChange={(resp => this.setUsername(resp.target.value))}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter Password Here"
                            value={this.state.password}
                            onChange={(resp => this.setPassword(resp.target.value))}
                            autoComplete="on"
                        />
                    </Form.Group>
                </Form>
                <Button variant="primary" type="submit" onClick={this.handleLogin}>
                    Login
                </Button>
                <Button variant="secondary" type="submit" onClick={this.handleResetPassword}>
                    Reset Password
                </Button>
            </Container>
        )
    }
}

export default Login