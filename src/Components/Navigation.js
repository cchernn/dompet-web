import React, { Component } from "react"
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
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
        console.log(this.state.isAuth)
        return (
            <Navbar className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home" ><img src="/logo192.png" height="45" alt="Hello" /></Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        {this.state.isAuth ? <Nav.Link href="/expenditures">Expenditures</Nav.Link> : null}
                    </Nav>
                    <Nav>
                        {this.state.isAuth ? <Logout /> : <Login />}
                    </Nav>
                </Container>
            </Navbar>
        )
    }
}

export default Navigation