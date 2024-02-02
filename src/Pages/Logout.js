import React, { Component } from "react"
import API from "../Services/API"

class Logout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: "",
        }
    }

    handleLogout = async () => {
        const payload = {
            refresh_token: localStorage.getItem('refresh_token')
        }
        try {
            await API.request(
                'post',
                '/logout',
                payload
            )

            localStorage.clear()
            delete API.api.defaults.headers.common['Authorization']
            window.location.href = '/'
        } catch (error) {
            this.setState({ error: "Invalid Credentials" })
        }
    }

    render() {
        return (
            <section id="logout-box" className="container">
                <div className="wrapper-logout">
                    <h2>Logout</h2>
                    <p>Click below to exit. Bye!</p>
                    <button id="logout-btn" type="button" onClick={this.handleLogout}>Logout</button>
                </div>
            </section>
        )
    }
}

export default Logout