import React, { Component } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Pages/Home"
import Contact from "./Pages/Contact"
import Register from "./Pages/Register"
import Profile from "./Pages/Profile"
import Login from "./Pages/Login"
import ResetPassword from "./Auth/ResetPassword"
import ResetPasswordConfirm from "./Auth/ResetPasswordConfirm"
import Navigation from './Components/Navigation'
import ExpenditureList from './Expenditure/ExpenditureList'

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Navigation></Navigation>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/expenditures" element={<ExpenditureList />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App