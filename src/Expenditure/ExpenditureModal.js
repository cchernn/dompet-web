import React, { Component } from "react"
import { Modal, Form, Button } from "react-bootstrap"

class ExpenditureModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: props.activeItem,
            errors: {}
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeItem !== this.props.activeItem) {
            this.setState({ activeItem: this.props.activeItem });
        }
    }

    validateSaveItem = () => {
        const errors = []
        const { date, name, location, amount, currency, type, payment_method } = this.state.activeItem
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
        return errors
    }

    handleSaveItem = () => {
        const localErrors = this.validateSaveItem()

        if (Object.keys(localErrors).length === 0) {
            this.setState(() => ({ errors: {} }))
            this.props.handleSaveItem(this.state.activeItem)
        } else {
            this.setState(() => ({
                errors: {
                    ...localErrors
                }
            }))
        }
        
    }

    handleChange = (event) => {
        let { name, value } = event.target
        
        if (event.target.type === "checkbox") {
            value = event.target.checked
        }

        const activeItem = { ...this.state.activeItem, [name]: value }

        this.setState({ activeItem })

    }

    render() {
        const { show, handleClose } = this.props

        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>Expenditure Item</Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={this.state.activeItem.date}
                                onChange={this.handleChange}
                                placeholder="date placeholder"
                            />
                            {
                                this.state.errors.date && (
                                    <div className="text-danger">{this.state.errors.date}</div>
                                )
                            }
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={this.state.activeItem.name}
                                onChange={this.handleChange}
                                placeholder="Enter Expenditure Name"
                            />
                            {
                                this.state.errors.name && (
                                    <div className="text-danger">{this.state.errors.name}</div>
                                )
                            }
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={this.state.activeItem.location}
                                onChange={this.handleChange}
                                placeholder="Enter Expenditure Location"
                            />
                            {
                                this.state.errors.location && (
                                    <div className="text-danger">{this.state.errors.location}</div>
                                )
                            }
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={this.state.activeItem.amount}
                                onChange={this.handleChange}
                                placeholder="Enter Expenditure Amount"
                            />
                            {
                                this.state.errors.amount && (
                                    <div className="text-danger">{this.state.errors.amount}</div>
                                )
                            }
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Currency</Form.Label>
                            <Form.Control
                                type="text"
                                name="currency"
                                value={this.state.activeItem.currency}
                                onChange={this.handleChange}
                                placeholder="Enter Expenditure Currency"
                            />
                            {
                                this.state.errors.currency && (
                                    <div className="text-danger">{this.state.errors.currency}</div>
                                )
                            }
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={this.state.activeItem.type}
                                onChange={this.handleChange}
                                // placeholder="Enter Expenditure Type"
                            >
                                <option value="spend">Spend</option>
                                <option value="receive">Receive</option>
                                <option value="transfer">Transfer</option>
                            </Form.Select>
                            {
                                this.state.errors.type && (
                                    <div className="text-danger">{this.state.errors.type}</div>
                                )
                            }
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Control
                                type="text"
                                name="payment_method"
                                value={this.state.activeItem.payment_method}
                                onChange={this.handleChange}
                                placeholder="Enter Expenditure Payment Method"
                            />
                            {
                                this.state.errors.payment_method && (
                                    <div className="text-danger">{this.state.errors.payment_method}</div>
                                )
                            }
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleSaveItem}
                    >Save
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default ExpenditureModal
