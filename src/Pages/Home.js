import React, { Component } from "react"
import { Container } from "react-bootstrap"

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            home_text: "",
            about_text: "",
            error: ""
        }
    }

    renderHome() {
        const myText = require("../Ext/Home.txt")
        
        fetch(myText)
            .then(response => response.text())
            .then((text) => {
                if (text !== null || text.trim() !== "") {
                    const home_text = (
                        <p className="text-black text-center my-4" style={{ fontSize: "1.25rem" }}>
                            {text}
                        </p>
                    )
                    this.setState({ home_text: home_text })
                }
            })
            .catch((error) => { this.setState({ error })})
    }

    renderAbout() {
        const myText = require("../Ext/About.txt")
        
        fetch(myText)
            .then(response => response.text())
            .then((text) => {
                if (text !== null || text.trim() !== "") {
                    const about_text = (
                        <p className="text-black text-center my-4" style={{ fontSize: "1.25rem" }}>
                            {text}
                        </p>
                    )
                    this.setState({ about_text: about_text })
                }
            })
            .catch((error) => { this.setState({ error })})
    }

    componentDidMount() {
        this.renderHome()
        this.renderAbout()
    }

    render() {  
        return (
            <Container id="home">
            { this.state.home_text &&
                <section id="home" className="mt-5 text-center">
                    <h1>Hello</h1>
                    { this.state.home_text }
                </section>
            }

            { this.state.about_text &&
                <section id="about" className="mt-5 text-center">
                    <h1>About</h1>
                    { this.state.about_text }
                </section>
            }
            </Container>
        )
    }
}

export default Home