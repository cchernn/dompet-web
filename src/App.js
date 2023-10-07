import React, { Component } from "react";
import Modal from "./components/Modal";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlusCircle } from "react-icons/fi";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expenditureList: [],
      modal: false,
      activeItem: {
        date: "",
        name: "",
        location: "",
        amount: 0,
        currency: "MYR",
        type: "",
        payment_method: "",
        user: "Chern Ning",
      },
    };
    this.headers = {
      date: "Date",
      name: "Name",
      location: "Location",
      amount: "Amount",
      currency: "Currency",
      type: "Type",
      payment_method: "Payment Method",
    };
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList = () => {
    axios
      .get("/api/expenditures/")
      .then((res) => this.setState({ expenditureList: res.data }))
      .catch((err) => console.log(err));
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };

  handleSubmit = (item) => {
    this.toggle();

    if (item.id) {
      axios
        .put(`/api/expenditures/${item.id}/`, item)
        .then((res) => this.refreshList());
      return;
    }
    axios
      .post("/api/expenditures/", item)
      .then((res) => this.refreshList());
  };

  handleDelete = (item) => {
    axios
      .delete(`/api/expenditures/${item.id}/`)
      .then((res) => this.refreshList());
  };

  createItem = () => {
    const item = { 
      date: "",
      name: "",
      location: "",
      amount: 0,
      currency: "",
      type: "",
      payment_method: "",
      user: "", 
    };

    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  editItem = (item) => {
    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  renderTableHeaders = () => {
    const data = this.state.expenditureList.filter(
      (item) => item.type === "Expenditure"
    );
    if (data.length === 0) {
      return null;
    }
    const headers = Object.values(this.headers);

    return (
      <thead>
        <tr>
          <th><button className="btn btn-primary" onClick={this.createItem}><FiPlusCircle /></button></th>
          <th></th>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
    )
  };

  renderTableBody = () => {
    const data = this.state.expenditureList.filter(
      (item) => item.type === "Expenditure"
    )
    .sort((a,b) => b.id - a.id);

    return (
      <tbody>
        {data.map((rowData, rowIndex) => (
          <tr key={rowIndex}>
            <td><button className="btn btn-secondary mr-2" onClick={() => this.editItem(rowData)}><FiEdit /></button></td>
            <td><button className="btn btn-secondary mr-2" onClick={() => this.handleDelete(rowData)}><FiTrash2 /></button></td>
            {Object.entries(rowData).map(([cellKey,cellValue], cellIndex) => (
              Object.keys(this.headers).includes(cellKey) && <td key={cellIndex}>{cellValue}</td>
            ))}
          </tr>
        ))}
    </tbody>
    );
  };

  render() {
    return (
      <main className="container">
        <h1 className="text-black text-uppercase text-center my-4">Expenditure app</h1>
        <div className="row">
          <div className="col-md-12 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <table className="table table-hover">
                {this.renderTableHeaders()}
                {this.renderTableBody()}
              </table>
            </div>
          </div>
        </div>
        {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        ) : null}
      </main>
    );
  }
}

export default App;