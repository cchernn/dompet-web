import React, { Component } from "react"

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
                        <p>
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
                        <p>
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
            <section className="container">
            { this.state.home_text &&
                <section>
                    <h2>Hello</h2>
                    { this.state.home_text }
                </section>
            }

            { this.state.about_text &&
                <section>
                    <h2>About</h2>
                    { this.state.about_text }
                </section>
            }
            </section>
        )
    }
}

export default Home