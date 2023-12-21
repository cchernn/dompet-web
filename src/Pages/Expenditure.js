import React, { Component } from "react"
import { Container, Card, Row, Col, Button } from "react-bootstrap"
import API from "../Services/API"

class Expenditure extends Component {
    constructor(props) {
        super(props)
        this.state = {
            expenditureGroupList: [],
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

    refreshList = async () => {
        await API.request(
            'get',
            '/expendituregroups',
            {}
        )
        .then((res) => this.setState({ expenditureGroupList: res.data }))
        .catch((err) => console.log(err))
    }


    render() {
        const data = this.state.expenditureGroupList
            .sort((a, b) => a.id - b.id)

        return (
            <Container>
                <h1 className="text-black text-uppercase text-center my-4">Expenditure Groups</h1>
                <Row xs={1} md={3} className="gx-2 gy-5">
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
                    
                </Row>
            </Container>
        )
    }
}

export default Expenditure