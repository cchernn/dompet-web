import React, { Component } from "react"
import { Container, Button, Row } from "react-bootstrap"
import ExpenditureModal from "./ExpenditureModal"
import { FiEdit, FiTrash2, FiPlusCircle } from "react-icons/fi"
import API from "../Services/API"

class ExpenditureList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            expenditure_list: [],
            show: false,
            active_item: {
                date: "",
                name: "",
                location: "",
                amount: 0,
                currency: "MYR",
                type: "spend",
                payment_method: "",
            }
        }
        this.headers = {
            date: "Date",
            name: "Name",
            location: "Location",
            amount: "Amount",
            currency: "Currency",
            type: "Type",
            payment_method: "Payment Method",
        }
    }

    componentDidMount() {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = "/login"
        } else {
            this.refreshList()
        }
    }

    refreshList = async () => {
        await API.request(
            'get',
            '/expenditures',
            {}
        )
        .then((res) => this.setState({ expenditure_list: res.data }))
        .catch((err) => console.log(err))
    }

    handleOpen = () => {
        this.setState({ show: true})
    }

    handleClose = () => {
        this.setState({ show: false})
    }

    handleSaveItem = async (item) => {
        this.handleClose()

        if (item.id) {
            await API.request(
                'put',
                `/expenditures/${item.id}`,
                item
            )
            .then((res) => this.refreshList())
            return
        }
        await API.request(
            'post',
            'expenditures',
            item
        )
        .then((res) => this.refreshList())
    }

    createItem = () => {
        const item = {
            date: "",
            name: "",
            location: "",
            amount: 0,
            currency: "MYR",
            type: "spend",
            payment_method: "",
        }
        this.setState(prevState => ({ 
            active_item: item,
            show: true
        }))
    }

    editItem = (item) => {
        this.setState(prevState => ({ 
            active_item: item,
            show: true
        }))
    }

    handleDelete = async (item) => {
        await API.request(
            'delete',
            `/expenditures/${item.id}`,
            {}
        )
        .then((res) => this.refreshList())
    }

    renderTableHeaders = () => {
        const headers = Object.values(this.headers)

        return (
            <thead>
                <tr>
                    <th><Button className="btn btn-primary" onClick={this.createItem}><FiPlusCircle /></Button></th>
                    <th></th>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
        )
    }

    renderTableBody = () => {
        const data = this.state.expenditure_list
            .sort((a, b) => b.id - a.id)

        return (
            <tbody>
                {data.map((rowData, rowIndex) => (
                    <tr key={rowIndex}>
                        <td><button className="btn btn-secondary mr-2" onClick={() => this.editItem(rowData)}><FiEdit /></button></td>
                        <td><button className="btn btn-secondary mr-2" onClick={() => this.handleDelete(rowData)}><FiTrash2 /></button></td>
                        {Object.entries(rowData).map(([cellKey, cellValue], cellIndex) => (
                            Object.keys(this.headers).includes(cellKey) && <td key={cellIndex}>{cellValue}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        )
    }

    render() {
        return (
            <Container>
                <h1 className="text-black text-uppercase text-center my-4">Expenditure app</h1>
                <Row>
                    <div className="col-md-12 col-sm-10 mx-auto p-0">
                        <div className="card p-3">
                            <table className="table table-hover">
                                {this.renderTableHeaders()}
                                {this.renderTableBody()}
                            </table>
                        </div>
                    </div>
                </Row>
                <ExpenditureModal
                    active_item = {this.state.active_item}
                    show = {this.state.show}
                    handleClose = {this.handleClose}
                    handleSaveItem = {this.handleSaveItem}
                />
            </Container>
        )
    }
}

export default ExpenditureList