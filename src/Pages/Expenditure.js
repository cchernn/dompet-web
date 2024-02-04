import React, { Component } from "react"
import { FiPlusCircle } from "react-icons/fi"
import API from "../Services/API"

class Expenditure extends Component {
    constructor(props) {
        super(props)
        this.state = {
            expenditureGroupList: [],
            show: false,
            isPermitted: false,
            error: ""
        }
    }

    componentDidMount() {
        this.refreshList()
    }

    handleDelete = async (item) => {
        await API.request(
            'delete',
            `/expendituregroups/${item.id}`,
            {}
        )
        .then((res) => this.refreshList())
        .catch((err) => {
            this.setState({ error: err})
        })
    }

    handleView = (item) => {
        const id = item.id
        window.location.href = `/expenditures/${id}/list`
    }

    handleCreate = () => {
        window.location.href = `/expenditures/create`
    }

    refreshList = async () => {
        await API.request(
            'get',
            '/expendituregroups',
            {}
        )
        .then((res) => {
            this.setState({ 
                expenditureGroupList: res.data,
                isPermitted: true 
            })
        })
        .catch((err) => {
            if (err.statusCode === 403) {
                this.setState({ isPermitted: false })
            }
            console.log('error', err)
        })
    }


    render() {
        const data = this.state.expenditureGroupList
            .sort((a, b) => a.id - b.id)

        if (this.state.isPermitted) {
            return (
                <section id="expenditure-box" className="container">
                    <h2>Expenditure Groups</h2>
                    <div className="expenditure-groups">
                        { data.map((rowData, rowIndex) => (
                            <section className="expenditure-group" key={rowIndex}>
                                <div className="expenditure-group-header">
                                    <h3>{rowData.name}</h3>
                                </div>
                                <div className="expenditure-group-content">
                                    <p>Owner: {rowData.username}</p>
                                    <p>Created Date: {rowData.inserted_at}</p>
                                    <p>Last Updated: {rowData.updated_at}</p>
                                </div>
                                <div className="expenditure-group-footer">
                                    <button id="expenditure-btn" type="button" onClick={() => this.handleView(rowData)}>View</button>
                                    <button id="expenditure-delete-btn" type="button" onClick={() => this.handleDelete(rowData)}>Delete</button>
                                </div>
                            </section>
                        ))}
                        <section className="expenditure-group-add" >
                            <button id="expenditure-group-add-btn" type="button" onClick={() => this.handleCreate()}><FiPlusCircle className="text-xl" /><p>Add a New Expenditure Group</p></button>
                        </section>
                    </div>
                </section>
            )
        } else {
            return (
                <section className="container">
                    <h2>Expenditure</h2>
                    <p>
                        Welcome to the Expenditure Page. Please contact Site Administrator for access to the Expenditure module.
                    </p>
                </section>
            )
        }
    }
}

export default Expenditure