import React, { Component } from "react"
import { Container, Card, Row, Col, Button } from "react-bootstrap"
import { FiPlusCircle } from "react-icons/fi"
import API from "../Services/API"
import ExpenditureGroupModal from "../Expenditure/ExpenditureGroupModal"

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
    }

    handleView = (item) => {
        const id = item.id
        window.location.href = `/expenditures/${id}/summary`
    }

    handleOpen = () => {
        this.setState({ show: true})
    }

    handleClose = () => {
        this.setState({ show: false})
    }

    handleSaveItem = async (item) => {
        this.handleClose()

        await API.request(
            'post',
            '/expendituregroups',
            item
        )
        .then((res) => this.refreshList())
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
                <Container>
                    <h1 className="text-black text-uppercase text-center my-4">Expenditure Groups</h1>
                    <Row xs={1} md={3} className="gx-2 gy-5" style={{ height:'300px' }}>
                        { data.map((rowData, rowIndex) => (
                            <Col key={rowIndex} className="d-flex">
                                <Card className="w-100 h-100 p-1">
                                    <Card.Header>
                                        <Card.Title>{rowData.name}</Card.Title>
                                    </Card.Header>
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Text>Owner: {rowData.username}</Card.Text>
                                        <Card.Text>Created Date: {rowData.inserted_at}</Card.Text>
                                        <Card.Text>Last Updated: {rowData.updated_at}</Card.Text>
                                    </Card.Body>
                                    <Card.Footer className="d-flex justify-content-end">
                                        <Button variant="danger" onClick={() => this.handleDelete(rowData)}className="m-1">
                                            Delete
                                        </Button>
                                        <Button variant="primary" onClick={() => this.handleView(rowData)} className="m-1">
                                            View
                                        </Button>                                    
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                        <Col key="new" className="d-flex">
                            <Card className="w-100 h-100 p-1">
                                <Card.Body className="d-flex flex-column">
                                    <Button className="w-100 h-100" variant="light" onClick={() => this.handleOpen()}>
                                        <FiPlusCircle className="text-xl" />
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <ExpenditureGroupModal 
                        show={this.state.show}
                        handleClose={this.handleClose}
                        handleSaveItem={this.handleSaveItem}
                    />

                </Container>
            )
        } else {
            return (
                <Container>
                    <h1 className="text-black text-uppercase text-center my-4">Expenditure</h1>
                    <p className="text-black text-center my-4">
                        Welcome to the Expenditure Page. Please contact Site Administrator for access to the Expenditure module.
                    </p>
                </Container>
            )
        }
    }
}

export default Expenditure