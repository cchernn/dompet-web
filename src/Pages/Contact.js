import React, { Component } from "react"
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
            <section id="contact-box" className="container">
                <div className="wrapper-contact">
                    <h2>Contact</h2>
                    <div className="contact-desc">
                        <p>
                            Feel free to contact me through the form below or email me <a href={`mailto:${process.env.REACT_APP_EMAIL}`}>here</a>.
                        </p>
                    </div>
                    <form>
                        <div className="input-box">
                            <input 
                                type="text"
                                id="name"
                                placeholder="Name: eg. John Doe"
                                value={this.state.name}
                                onChange={(resp => this.setName(resp.target.value))}
                            />
                        </div>
                        <div className="input-box">
                            <input 
                                type="email"
                                id="email"
                                placeholder="Email: eg. johndoe@gmail.com"
                                value={this.state.email}
                                onChange={(resp => this.setEmail(resp.target.value))}
                            />
                        </div>
                        <div className="textarea-box">
                            <textarea
                                id="message"
                                rows="5"
                                placeholder="Message"
                                value={this.state.message}
                                onChange={(resp => this.setMessage(resp.target.value))}
                            ></textarea>
                        </div>
                        <button id="contact-btn" type="button" onClick={this.handleSubmit}>Submit</button>
                        {
                            this.state.error && (
                                <div className="error">
                                    <p>{this.state.error}</p>
                                </div>
                            )
                        }
                        {
                            this.state.resMessage && (
                                <div className="success">
                                    <p>{this.state.resMessage}</p>
                                </div>
                            )
                        }
                    </form>
                </div>
            </section>
        )
    }
}

export default Contact