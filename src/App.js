import React, { Component } from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './Auth/axiox';
import Home from "./Pages/Home"
import Navigation from './Components/Navigation';
import Expenditures from './BudgetTrack/expenditures';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Navigation></Navigation>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/expenditures" element={<Expenditures/>}/>
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;