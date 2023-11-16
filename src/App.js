import React, { Component } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import './Components/Axiox'
import Home from "./Pages/Home"
import Register from "./Pages/Register"
import Navigation from './Components/Navigation'
import ExpenditureList from './BudgetTrack/ExpenditureList'

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Navigation></Navigation>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/expenditures" element={<ExpenditureList />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App