import React, { Component } from "react"
import { Container, Form, Button } from "react-bootstrap"
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
                    window.location.href = "/"
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
            <Container>
                <h1>Register</h1>
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
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter Email Here"
                            value={this.state.email}
                            onChange={(resp => this.setEmail(resp.target.value))}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter First Name Here"
                            value={this.state.first_name}
                            onChange={(resp => this.setFirstName(resp.target.value))}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Last Name Here"
                            value={this.state.last_name}
                            onChange={(resp => this.setLastName(resp.target.value))}
                        />
                    </Form.Group>
                    <Button variant="secondary">
                        Close
                    </Button>
                    <Button variant="primary" type="submit" onClick={this.handleRegister}>
                        Register
                    </Button>
                    {
                        this.state.error && (
                            <div className="text-danger">{this.state.error}</div>
                        )
                    }
                </Form>
            </Container>
        )
    }
}

export default Register