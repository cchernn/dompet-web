import React, { Component } from "react"
import { Modal, Form, Button } from "react-bootstrap"

class ExpenditureGroupModal extends Component {
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
            this.props.handleSaveItem(item)
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
                <Modal.Header closeButton>New Expenditure Group</Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={this.state.activeItem.name}
                                onChange={this.handleChange}
                                placeholder="Enter Expenditure Group Name"
                            />
                            {
                                this.state.errors.name && (
                                    <div className="text-danger">{this.state.errors.name}</div>
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

export default ExpenditureGroupModal