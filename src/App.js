import React, { Component } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./App.css"
import "./Styles/Navigation.css"
import "./Styles/Pages.css"
import "./Styles/Expenditure.css"
import Home from "./Pages/Home"
import Contact from "./Pages/Contact"
import Register from "./Pages/Register"
import Profile from "./Pages/Profile"
import Login from "./Pages/Login"
import Logout from "./Pages/Logout"
import Expenditure from "./Pages/Expenditure"
import ResetPassword from "./Auth/ResetPassword"
import ResetPasswordConfirm from "./Auth/ResetPasswordConfirm"
import Navigation from './Components/Navigation'
import ExpenditureList from './Expenditure/ExpenditureList'
import ExpenditureSummary from './Expenditure/ExpenditureSummary'
import ExpenditureHistorical from './Expenditure/ExpenditureHistorical'
import ExpenditureCreate from './Expenditure/ExpenditureCreate'
import ExpenditureGroupCreate from './Expenditure/ExpenditureGroupCreate'
import ExpenditureDetail from './Expenditure/ExpenditureDetail'

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Navigation></Navigation>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/expenditures" element={<Expenditure />} />
                    <Route path="/expenditures/create" element={<ExpenditureGroupCreate />} />
                    <Route path="/expenditures/:groupId/summary" element={<ExpenditureSummary />} />
                    <Route path="/expenditures/:groupId/historical" element={<ExpenditureHistorical />} />
                    <Route path="/expenditures/:groupId/list" element={<ExpenditureList />} />
                    <Route path="/expenditures/:groupId/create" element={<ExpenditureCreate />} />
                    <Route path="/expenditures/:groupId/:expId" element={<ExpenditureDetail />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App