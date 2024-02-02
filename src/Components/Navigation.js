import React, { Component } from "react"
import { BsPerson, BsPersonAdd } from "react-icons/bs";
import { FaDoorClosed } from "react-icons/fa6";

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
            <header>
                <nav>
                    <div></div>
                    <ul className="nav-links">
                        <li className="nav-link"><a href="/">Home</a></li>
                        <li className="nav-link"><a href="/contact">Contact</a></li>
                        {this.state.isAuth ? 
                            <li className="nav-link"><a href="/expenditures">Expenditures</a></li> :
                            null
                        }
                    </ul>
                    {this.state.isAuth ?
                        <div className="nav-links">
                            <a className="nav-btn" data-text="Profile" href="/profile"><BsPerson /></a>
                            <a className="nav-btn" data-text="Logout" href="/logout"><FaDoorClosed /></a>
                        </div>
                        :
                        <div className="nav-links">
                            <a className="nav-btn" data-text="Register" href="/register"><BsPersonAdd /></a>
                            <a className="nav-btn" data-text="Login" href="/login"><FaDoorClosed /></a>
                        </div>
                    }
                </nav>
            </header>
        )
    }
}

export default Navigation