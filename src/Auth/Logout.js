import React, { Component } from "react"
import { Modal, Button, Nav } from "react-bootstrap"
import axios from "axios"

class Logout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            show: false,
            error: "",
        }
    }

    handleLogout = async () => {
        const payload = {
            refresh_token: localStorage.getItem('refresh_token')
        }
        try {
            await axios.post(
                "http://localhost:8000/api/logout",
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            )

            localStorage.clear()
            axios.defaults.headers.common['Authorization'] = null
            this.setState({ show: false })
            window.location.href = '/'
        } catch (error) {
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
                    Logout
                </Nav.Link>
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Logout</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Click the Logout button to confirm Logout.
                    </Modal.Body>
                    <Modal.Footer>
                        {
                            this.state.error && (
                                <div className="text-danger">{this.state.error}</div>
                            )
                        }
                        <Button variant="secondary" onClick={this.handleClose}>
                            Back
                        </Button>
                        <Button variant="primary" type="submit" onClick={this.handleLogout}>
                            Logout
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Logout