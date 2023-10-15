import React, { Component } from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './Auth/axiox';
import {Login} from "./Auth/login";
import {Home} from "./Auth/home";
import {Navigation} from './Auth/navigation';
import {Logout} from './Auth/logout';
import Expenditures from './BudgetTrack/expenditures';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Navigation></Navigation>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/expenditures" element={<Expenditures/>}/>
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;