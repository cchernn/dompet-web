import React, { Component } from "react"
import { Modal, Button, Form, Nav } from "react-bootstrap"
import API from "../Services/API"

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: "",
            show: false,
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
            this.setState({ show: false })
            window.location.href = '/'
        } catch (error) {
            console.log(error)
            this.setState({ error: "Invalid Credentials" })
        }
    }

    handleOpen = () => {
        this.setState({ show: true })
    }

    handleClose = () => {
        this.setState({ show: false })
    }

    render() {
        return (
            <div>
                <Nav.Link onClick={this.handleOpen}>
                    Login
                </Nav.Link>
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Login</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
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
                    </Modal.Body>
                    <Modal.Footer>
                        {
                            this.state.error && (
                                <div className="text-danger">{this.state.error}</div>
                            )
                        }
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit" onClick={this.handleLogin}>
                            Login
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Login