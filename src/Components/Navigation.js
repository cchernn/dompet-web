import React, { Component } from "react"
import { Nav, Navbar, Container } from 'react-bootstrap'
import Login from "../Auth/Login"
import Logout from "../Auth/Logout"

class Navigation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isAuth: false
        }
    }

    componentDidMount() {
        if (localStorage.getItem('access_token') !== null) {
            this.setState({ 'isAuth': true })
        }
    }

    render() {
        return (
            <Navbar className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home" ><img src="/logo192.png" height="45" alt="Hello" /></Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-toggle" />
                    <Navbar.Collapse id="navbar-toggle">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            {this.state.isAuth ?
                                <Nav.Link href="/expenditures">Expenditures</Nav.Link>
                                : 
                                null}
                        </Nav>
                        <Nav>
                            {this.state.isAuth ? 
                                <Logout /> 
                                : 
                                <>
                                    <Nav.Link href="/register">Register</Nav.Link>
                                    <Login />
                                </>}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    }
}

export default Navigation