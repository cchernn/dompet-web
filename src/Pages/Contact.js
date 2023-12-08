import React, { Component } from "react"
import { Container, Form, Button } from "react-bootstrap"
import Email from "../Services/EmailJS"

class Contact extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: "",
            email: "",
            message: "",
            error: "",
            resMessage: ""
        }
    }

    setName = (name) => {
        this.setState({ name })
    }

    setEmail = (email) => {
        this.setState({ email })
    }

    setMessage = (message) => {
        this.setState({ message })
    }

    handleSubmit = async (e) => {
        e.preventDefault()

        // Basic validation for name and email
        if (!this.state.name || !this.state.email) {
            this.setState({
                error: "Name and email are required fields"
            })
            return 
        }

        // You can add more complex email validation if needed
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.state.email)) {
            this.setState({
                error: "Invalid Email format"
            })
            return 
        }

        const payload = {
            name: this.state.name,
            email: this.state.email,
            message: this.state.message
        }
        try {
            await Email.sendQuery(payload)
            this.setState({ 
                name: "",
                email: "",
                message: "",
                resMessage: "Email sent. Thank you for your query.",
                error: ""
            })
        } catch (error) {
            this.setState({ error: "Email failed to send. Sorry, please try again later." })
        }
    }

    render() {
        return (
            <Container>
                <div className="mt-5 text-center">
                    <h1>Contact</h1>
                </div>
                <Form>
                    <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="name"
                            value={this.state.name}
                            onChange={(resp => this.setName(resp.target.value))}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            value={this.state.email}
                            onChange={(resp => this.setEmail(resp.target.value))}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={this.state.message}
                            onChange={(resp => this.setMessage(resp.target.value))}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                        Submit
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
                </Form>
            </Container>
        )
    }
}

export default Contact