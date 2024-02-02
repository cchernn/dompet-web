import React, { Component } from "react"
import API from "../Services/API"

class ExpenditureGroupCreate extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: {
                name: ""
            },
            errors: {}
        }
    }

    validateSaveItem = () => {
        const errors = []
        const { name } = this.state.activeItem
        if (!name) {
            errors.name = "Name should not be empty"
        }
        return errors
    }

    handleSaveItem = async () => {
        const localErrors = this.validateSaveItem()
        const item = this.state.activeItem

        if (Object.keys(localErrors).length === 0) {
            this.setState(() => ({ errors: {} }))
            await API.request(
                'post',
                '/expendituregroups',
                item
            )
            .then((res) => window.location.href = `/expenditures`)
        } else {
            this.setState(() => ({
                errors: {
                    ...localErrors
                }
            }))
        }
    }

    setExpenditureGroupName = (name) => {
        this.setState({ activeItem: {
            ...this.state.activeItem,   
            name: name 
        }})
    }

    render() {
        return (
            <section id="expenditure-group-create-box" className="container">
                <div className="wrapper-expenditure-group-create">
                    <h2>New Expenditure Group</h2>
                    <form>
                        <div className="input-box">
                            <input 
                                type="text"
                                id="name"
                                placeholder="Expenditure Group Name"
                                value={this.state.activeItem.name}
                                onChange={(resp => this.setExpenditureGroupName(resp.target.value))}
                            />
                        </div>
                        <button id="expenditure-group-create-btn"type="button" onClick={this.handleSaveItem}>Save</button>     
                        {
                            this.state.errors.name && (
                                <div className="error"><p>{this.state.errors.name}</p></div>
                            )
                        }                   
                    </form>
                </div>
            </section>
        )
    }
}

export default ExpenditureGroupCreate