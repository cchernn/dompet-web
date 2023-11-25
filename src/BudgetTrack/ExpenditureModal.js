import React, { Component } from "react"
import { Modal, Form, Button } from "react-bootstrap"

class ExpenditureModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active_item: props.active_item,
            errors: {}
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.active_item !== this.props.active_item) {
            this.setState({ active_item: this.props.active_item });
        }
    }

    validateSaveItem = () => {
        const errors = []
        const { date, name, location, amount, currency, type, payment_method } = this.state.active_item
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
            this.props.handleSaveItem(this.state.active_item)
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

        const active_item = { ...this.state.active_item, [name]: value }

        this.setState({ active_item })

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
                                value={this.state.active_item.date}
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
                                value={this.state.active_item.name}
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
                                value={this.state.active_item.location}
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
                                value={this.state.active_item.amount}
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
                                value={this.state.active_item.currency}
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
                                value={this.state.active_item.type}
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
                                value={this.state.active_item.payment_method}
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
