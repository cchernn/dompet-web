import React, { Component } from "react"
import { Modal, Form, Button } from "react-bootstrap"

class ExpenditureModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active_item: props.active_item,
            error: "",
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.active_item !== this.props.active_item) {
            this.setState({ active_item: this.props.active_item });
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
        const { show, handleClose, handleSaveItem } = this.props

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
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                type="text"
                                name="type"
                                value={this.state.active_item.type}
                                onChange={this.handleChange}
                                placeholder="Enter Expenditure Type"
                            />
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
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {
                        this.state.error && (
                            <div className="text-danger">{this.state.error}</div>
                        )
                    }
                    <Button variant="primary" onClick={() => handleSaveItem(this.state.active_item)}
                    >Save
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default ExpenditureModal
