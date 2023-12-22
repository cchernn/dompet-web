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
        const {username, email, first_name, last_name, is_superuser, group_names} = this.state.profileData

        return (
            <Container>
                <div className="text-center my-5">
                    <p>Username: {username}</p>
                    <p>Email: {email}</p>
                    <p>First Name: {first_name}</p>
                    <p>Last Name: {last_name}</p>
                    <p>Modules: {is_superuser ? "All" : group_names}</p>
                </div>
            </Container>
        )
    }
}

export default Profile