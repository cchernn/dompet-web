import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

export default class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: this.props.activeItem,
    };
  }

  handleChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }

    const activeItem = { ...this.state.activeItem, [name]: value };

    this.setState({ activeItem });
  };

  render() {
    const { toggle, onSave } = this.props;
    return (
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>Expenditure Item</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="expenditure-date">Date</Label>
              <Input
                type="date"
                id="expenditure-date"
                name="date"
                value={this.state.activeItem.date}
                onChange={this.handleChange}
                placeholder="date placeholder"
              />
            </FormGroup>
            <FormGroup>
              <Label for="expenditure-name">Name</Label>
              <Input
                type="text"
                id="expenditure-name"
                name="name"
                value={this.state.activeItem.name}
                onChange={this.handleChange}
                placeholder="Enter Expenditure Name"
              />
            </FormGroup>
            <FormGroup>
              <Label for="expenditure-location">Location</Label>
              <Input
                type="text"
                id="expenditure-location"
                name="location"
                value={this.state.activeItem.location}
                onChange={this.handleChange}
                placeholder="Enter Expenditure Location"
              />
            </FormGroup>
            <FormGroup>
              <Label for="expenditure-amount">Amount</Label>
              <Input
                type="number"
                id="expenditure-amount"
                name="amount"
                value={this.state.activeItem.amount}
                onChange={this.handleChange}
                placeholder="Enter Expenditure Amount"
              />
            </FormGroup>
            <FormGroup>
              <Label for="expenditure-currency">Currency</Label>
              <Input
                type="text"
                id="expenditure-currency"
                name="currency"
                value={this.state.activeItem.currency}
                onChange={this.handleChange}
                placeholder="Enter Expenditure Currency"
              />
            </FormGroup>
            <FormGroup>
              <Label for="expenditure-type">Type</Label>
              <Input
                type="text"
                id="expenditure-type"
                name="type"
                value={this.state.activeItem.type}
                onChange={this.handleChange}
                placeholder="Enter Expenditure Type"
              />
            </FormGroup>
            <FormGroup>
              <Label for="expenditure-payment_method">Payment Method</Label>
              <Input
                type="text"
                id="expenditure-payment_method"
                name="payment_method"
                value={this.state.activeItem.payment_method}
                onChange={this.handleChange}
                placeholder="Enter Expenditure Payment Method"
              />
            </FormGroup>
            <FormGroup>
              <Label for="expenditure-user">User</Label>
              <Input
                type="text"
                id="expenditure-user"
                name="user"
                value={this.state.activeItem.user}
                onChange={this.handleChange}
                placeholder="Enter Expenditure User"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={() => onSave(this.state.activeItem)}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}