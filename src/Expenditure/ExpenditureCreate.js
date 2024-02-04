import React, { Component } from "react"
import API from "../Services/API"
import { useParams } from "react-router-dom"

class ExpenditureCreateClass extends Component {
    constructor(props) {
        super(props)
        const { groupId } = props
        this.state = {
            groupId: groupId,
            activeItem: {
                date: "",
                name: "",
                location: "",
                amount: 0,
                currency: "MYR",
                type: "spend",
                payment_method: "",
                category: "others",
                attachment: "",
            },
            errors: {}
        }
    }

    validateSaveItem = () => {
        const errors = []
        const { date, name, location, amount, currency, type, payment_method, category } = this.state.activeItem
        if (!date) {
            errors.date = "Date should not be empty"
        }
        if (!name) {
            errors.name = "Name should not be empty"
        }
        if (!location) {
            errors.location = "Location should not be empty"
        }
        if (amount < 0) {
            errors.amount = "Amount should be 0 or positive value"
        }
        if (!currency) {
            errors.currency = "Currency should not be empty"
        }
        if (!type) {
            errors.type = "Type should not be empty"
        }
        if (!payment_method) {
            errors.payment_method = "Payment Method should not be empty"
        }
        if (!category) {
            errors.category = "Category should not be empty"
        }
        console.log("errors", errors)
        return errors
    }

    handleSaveItem = async () => {
        const localErrors = this.validateSaveItem()
        const item = this.state.activeItem

        if (Object.keys(localErrors).length === 0) {
            this.setState(() => ({ errors: {} }))
            const groupId = this.state.groupId

            await API.request(
                'post',
                `/expendituregroups/${groupId}/expenditures`,
                item
            )
            .then((res) => window.location.href = `/expenditures/${groupId}/list`)
            .catch((err) => {
                console.log("error", err)
            })
        } else {
            this.setState(() => ({
                errors: {
                    ...localErrors
                }
            }))
        }
        
    }

    handleChange = (resp) => {
        const { id, value } = resp.target

        this.setState({ activeItem: {
            ...this.state.activeItem,   
            [id]: value 
        }})
    }

    render() {
        return (
            <section id="expenditure-create-box" className="container">
                <div className="wrapper-expenditure-create">
                    <h2>Expenditure Item</h2>
                    <form>
                        <div className="input-box">
                            <input 
                                type="date"
                                id="date"
                                placeholder="Date"
                                value={this.state.activeItem.date}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.date && (
                                <div className="error"><p>{this.state.errors.date}</p></div>
                            )
                        }
                        <div className="input-box">
                            <input 
                                type="text"
                                id="name"
                                placeholder="Name"
                                value={this.state.activeItem.name}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.name && (
                                <div className="error"><p>{this.state.errors.name}</p></div>
                            )
                        }                        
                        <div className="input-box">
                            <input 
                                type="text"
                                id="location"
                                placeholder="Location"
                                value={this.state.activeItem.location}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.location && (
                                <div className="error"><p>{this.state.errors.location}</p></div>
                            )
                        }                    
                        <div className="input-box">
                            <input 
                                type="number"
                                id="amount"
                                placeholder="Amount"
                                value={this.state.activeItem.amount}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.amount && (
                                <div className="error"><p>{this.state.errors.amount}</p></div>
                            )
                        }                        
                        <div className="input-box">
                            <input 
                                type="text"
                                id="currency"
                                placeholder="Enter Expenditure Currency"
                                value={this.state.activeItem.currency}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.currency && (
                                <div className="error"><p>{this.state.errors.currency}</p></div>
                            )
                        }
                        <div className="select-box">
                            <select 
                                name="type"
                                id="type"
                                value={this.state.activeItem.type}
                                onChange={(resp => this.handleChange(resp))}
                            >
                                <option value="spend">Spend</option>
                                <option value="receive">Receive</option>
                                <option value="transfer">Transfer</option>
                            </select>
                        </div>
                        {
                            this.state.errors.type && (
                                <div className="error"><p>{this.state.errors.type}</p></div>
                            )
                        }
                        <div className="input-box">
                            <input 
                                type="text"
                                id="payment_method"
                                placeholder="Payment Method"
                                value={this.state.activeItem.payment_method}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.payment_method && (
                                <div className="error"><p>{this.state.errors.payment_method}</p></div>
                            )
                        }
                        <div className="input-box">
                            <input 
                                type="text"
                                id="category"
                                placeholder="Category"
                                value={this.state.activeItem.category}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.category && (
                                <div className="error"><p>{this.state.errors.category}</p></div>
                            )
                        }
                        <div className="input-box">
                            <input 
                                type="text"
                                id="attachment"
                                placeholder="Attachment"
                                value={this.state.activeItem.attachment}
                                onChange={(resp => this.handleChange(resp))}
                            />
                        </div>
                        {
                            this.state.errors.attachment && (
                                <div className="error"><p>{this.state.errors.attachment}</p></div>
                            )
                        }
                        <button id="expenditure-create-btn" type="button" onClick={this.handleSaveItem}>Save</button>    
                    </form>
                </div>
            </section>
        )
    }
}

const ExpenditureCreate = () => {
    const params = useParams()
    const { groupId } = params

    return (
      <>
        <ExpenditureCreateClass groupId={groupId} />
      </>
    );
  };

export default ExpenditureCreate