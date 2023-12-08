import React, { Component } from "react"
import { Container } from "react-bootstrap"
import API from "../Services/API"

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            profileData: {
                username: "",
                email: "",
                first_name: "",
                last_name: ""
            }
        }
    }
    
    componentDidMount() {
        this.getProfile()
    }

    getProfile = async () => {
        await API.request(
            'get',
            '/me',
            {}
        )
        .then((res) => this.setState({ profileData: res.data }))
        .catch((err) => console.log(err))
    }

    render() {
        const {username, email, first_name, last_name} = this.state.profileData

        return (
            <Container>
                <ul>
                    <li>Username: {username}</li>
                    <li>Email: {email}</li>
                    <li>First Name: {first_name}</li>
                    <li>Last Name: {last_name}</li>
                </ul>
            </Container>
        )
    }
}

export default Profile