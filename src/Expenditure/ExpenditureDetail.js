import React, { Component } from "react"
import API from "../Services/API"   
import { useParams } from "react-router-dom"

class ExpenditureDetailClass extends Component {
    constructor(props) {
        super(props)
        const { groupId, expId } = props
        this.state = {
            editMode: false,
            groupId: groupId,
            expId: expId,
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
        this.headers = {
            date: "Date",
            name: "Name",
            location: "Location",
            amount: "Amount",
            currency: "Currency",
            type: "Type",
            payment_method: "Payment Method",
            username: "User",
            category: "Category",
            attachment: "Attachment",
        }
    }

    componentDidMount() {
        this.refreshItem()
    }

    refreshItem = async () => {
        const { groupId, expId } = this.state

        await API.request(
            'get',
            `/expendituregroups/${groupId}/expenditures/${expId}`,
            {}
        )
        .then((res) => {
            this.setState({ activeItem: res.data })
        })
        .catch((err) => console.log(err))
    }

    toggleEditMode = (value) => {
        this.setState({ editMode: value })
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
        return errors
    }

    handleSaveItem = async () => {
        const localErrors = this.validateSaveItem()
        const item = this.state.activeItem

        if (Object.keys(localErrors).length === 0) {
            this.setState(() => ({ errors: {} }))
            const groupId = this.state.groupId

            if (item.id) {
                await API.request(
                    'put',
                    `/expendituregroups/${groupId}/expenditures/${item.id}`,
                    item
                )
                .then((res) => {
                    this.toggleEditMode(false)
                })
                return
            }
        } else {
            this.setState(() => ({
                errors: {
                    ...localErrors
                }
            }))
        }
        
    }

    handleDelete = async () => {
        const groupId = this.state.groupId
        const item = this.state.activeItem

        await API.request(
            'delete',
            `/expendituregroups/${groupId}/expenditures/${item.id}`,
            {}
        )
        .then((res) => {
            window.location.href = `/expenditures/${groupId}/list`
        })
    }

    handleChange = (resp) => {
        const { id, value } = resp.target

        this.setState({ activeItem: {
            ...this.state.activeItem,   
            [id]: value 
        }})

    }

    handleExit = () => {
        const groupId = this.state.groupId

        window.location.href = `/expenditures/${groupId}/list`
    }

    render() {
        const { activeItem, editMode } = this.state
        
        return (
            <section id="expenditure-detail-box" className="container">
                <div className="wrapper-expenditure-detail">
                <h2>Expenditure Detail - {this.state.expId}</h2>
                    {
                        editMode ?
                        <ul>
                        <form>
                            <li className="row" key="date">
                                <div className="row-column row-column-key">Date</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="date"
                                        id="date"
                                        placeholder="date placeholder"
                                        value={this.state.activeItem.date}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.date && (
                                            <div className="error"><p>{this.state.errors.date}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="name">
                                <div className="row-column row-column-key">Name</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="text"
                                        id="name"
                                        placeholder="Enter Expenditure Name"
                                        value={this.state.activeItem.name}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.name && (
                                            <div className="error"><p>{this.state.errors.name}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="location">
                                <div className="row-column row-column-key">Location</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="text"
                                        id="location"
                                        placeholder="Enter Expenditure Location"
                                        value={this.state.activeItem.location}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.location && (
                                            <div className="error"><p>{this.state.errors.location}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="amount">
                                <div className="row-column row-column-key">Amount</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="number"
                                        id="amount"
                                        placeholder="Enter Expenditure Amount"
                                        value={this.state.activeItem.amount}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.amount && (
                                            <div className="error"><p>{this.state.errors.amount}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="currency">
                                <div className="row-column row-column-key">Currency</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="text"
                                        id="currency"
                                        placeholder="Enter Expenditure Currency"
                                        value={this.state.activeItem.currency}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.currency && (
                                            <div className="error"><p>{this.state.errors.currency}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="type">
                                <div className="row-column row-column-key">Type</div>
                                <div className="row-column row-column-value select-box">
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
                                    {
                                        this.state.errors.name && (
                                            <div className="error"><p>{this.state.errors.name}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="payment_method">
                                <div className="row-column row-column-key">Payment Method</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="text"
                                        id="payment_method"
                                        placeholder="Enter Expenditure Payment Method"
                                        value={this.state.activeItem.payment_method}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.payment_method && (
                                            <div className="error"><p>{this.state.errors.payment_method}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="category">
                                <div className="row-column row-column-key">Category</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="text"
                                        id="category"
                                        placeholder="Enter Expenditure Category"
                                        value={this.state.activeItem.category}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.category && (
                                            <div className="error"><p>{this.state.errors.category}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <li className="row" key="attachment">
                                <div className="row-column row-column-key">Attachment</div>
                                <div className="row-column row-column-value input-box">
                                    <input 
                                        type="text"
                                        id="attachment"
                                        placeholder="Enter Expenditure Attachment"
                                        value={this.state.activeItem.attachment}
                                        onChange={(resp => this.handleChange(resp))}
                                    />
                                    {
                                        this.state.errors.attachment && (
                                            <div className="error"><p>{this.state.errors.attachment}</p></div>
                                        )
                                    }
                                </div>
                            </li>
                            <div className="expenditure-detail-btn-list">
                                <button id="expenditure-detail-save-btn" type="button" onClick={() => this.handleSaveItem()}>Save</button>
                                <button id="expenditure-detail-edit-exit-btn" type="button" onClick={() => this.toggleEditMode(false)}>Back</button>
                            </div>
                        </form>
                        </ul>
                        :
                        <>
                        <ul>
                            {Object.entries(activeItem).map(([key, value]) => {
                                if (key === "attachment") {
                                    return (
                                        <li className="row" key={key}>
                                            <div className="row-column row-column-key">{this.headers[key]}</div>
                                            <div className="row-column row-column-value">{(value !== null && value !== "") ? <a className="expenditure-detail-attachment" href={value}>{value}</a> : ""}</div>
                                        </li>
                                    )
                                } else if (Object.keys(this.headers).includes(key)) {
                                    return (
                                        <li className="row" key={key}>
                                            <div className="row-column row-column-key">{this.headers[key]}</div>
                                            <div className="row-column row-column-value">{value}</div>
                                        </li>
                                    )
                                } else {
                                    return null
                                }
                            })}
                        </ul>
                        <div className="expenditure-detail-btn-list">
                            <button id="expenditure-detail-edit-btn" type="button" onClick={() => this.toggleEditMode(true)}>Edit</button>
                            <button id="expenditure-detail-delete-btn" type="button" onClick={() => this.handleDelete()}>Delete</button>
                            <button id="expenditure-detail-exit-btn" type="button" onClick={() => this.handleExit()}>Back</button>
                        </div>
                        </>
                    }
                </div>
            </section>
        )
    }
}

const ExpenditureDetail = () => {
    const params = useParams()
    const { groupId, expId } = params

    return (
      <>
        <ExpenditureDetailClass groupId={groupId} expId={expId} />
      </>
    );
  };

export default ExpenditureDetail