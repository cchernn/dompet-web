import React, { Component } from "react"
import { Container, Button, Row, Pagination } from "react-bootstrap"
import ExpenditureModal from "./ExpenditureModal"
import { FiEdit, FiTrash2, FiPlusCircle, FiFile } from "react-icons/fi"
import { useParams } from "react-router-dom"
import API from "../Services/API"   

class ExpenditureListClass extends Component {
    constructor(props) {
        super(props)
        const { groupId } = props
        this.state = {
            expenditureList: [],
            show: false,
            groupId: groupId,
            totalPageNo: 1,
            activePageNo: 1,
            pageSize: process.env.REACT_APP_PAGESIZE,
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
            }
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
        this.refreshList()
    }

    refreshList = async () => {
        const groupId = this.state.groupId

        await API.request(
            'get',
            `/expendituregroups/${groupId}/expenditures`,
            {
                'page': this.state.activePageNo
            }
        )
        .then((res) => {
            this.setState({ expenditureList: res.data.results })
            this.calcTotalPageNo(res.data.count)
        })
        .catch((err) => console.log(err))
    }

    handleOpen = () => {
        this.setState({ show: true})
    }

    handleClose = () => {
        this.setState({ show: false})
    }

    handleSaveItem = async (item) => {
        const groupId = this.state.groupId
        this.handleClose()

        if (item.id) {
            await API.request(
                'put',
                `/expendituregroups/${groupId}/expenditures/${item.id}`,
                item
            )
            .then((res) => this.refreshList())
            return
        }
        await API.request(
            'post',
            `/expendituregroups/${groupId}/expenditures`,
            item
        )
        .then((res) => this.refreshList())
    }

    createItem = () => {
        const item = {
            date: "",
            name: "",
            location: "",
            amount: 0,
            currency: "MYR",
            type: "spend",
            payment_method: "",
            category: "others",
            attachment: "",
        }
        this.setState(prevState => ({ 
            activeItem: item,
            show: true
        }))
    }

    editItem = (item) => {
        this.setState(prevState => ({ 
            activeItem: item,
            show: true
        }))
    }

    handleDelete = async (item) => {
        const groupId = this.state.groupId

        await API.request(
            'delete',
            `/expendituregroups/${groupId}/expenditures/${item.id}`,
            {}
        )
        .then((res) => this.refreshList())
    }

    calcTotalPageNo = (count) => {
        let totalPages = Math.ceil( count/this.state.pageSize )
        this.setState({ totalPageNo: totalPages })
    }

    handlePageClick = (count) => {
        this.setState({ activePageNo: count }, () => this.refreshList())
    }

    renderTableHeaders = () => {
        const headers = Object.values(this.headers)

        return (
            <thead>
                <tr>
                    <th><Button className="btn btn-primary" onClick={this.createItem}><FiPlusCircle /></Button></th>
                    <th></th>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
        )
    }

    renderTableBody = () => {
        const data = this.state.expenditureList
            .sort((a, b) => b.id - a.id)

        return (
            <tbody>
                {data.map((rowData, rowIndex) => (
                    <tr key={rowIndex}>
                        <td><button className="btn btn-secondary mr-2" onClick={() => this.editItem(rowData)}><FiEdit /></button></td>
                        <td><button className="btn btn-secondary mr-2" onClick={() => this.handleDelete(rowData)}><FiTrash2 /></button></td>
                        {Object.entries(rowData).map(([cellKey, cellValue], cellIndex) => {
                            if (cellKey === "attachment") {
                                return <td key={cellIndex} className="text-center">{(cellValue !== null && cellValue !== "") ? <a className="btn btn-secondary mr-2" href={cellValue}><FiFile /></a> : ""}</td>
                            } else if (Object.keys(this.headers).includes(cellKey)) {
                                return <td key={cellIndex}>{cellValue}</td>
                            } else {
                                return null
                            }
                        })}
                    </tr>
                ))}
            </tbody>
        )
    }

    renderPaginationElement = () => {
        const activePageNo = this.state.activePageNo
        const totalPageNo = this.state.totalPageNo
        
        const lowerPageNo = Math.max(1, this.state.activePageNo - 2)
        const upperPageNo = Math.min(totalPageNo, this.state.activePageNo + 2)

        const pages = []
        for (let count = lowerPageNo; count <= upperPageNo; count++ ) {
            pages.push(
                <Pagination.Item 
                    key={count} 
                    active={count === activePageNo}
                    onClick={() => this.handlePageClick(count)}
                >
                    {count}
                </Pagination.Item>
            )
        }

        return (
            <Pagination>
                <Pagination.First onClick={() => this.handlePageClick(1)} />
                {pages}
                <Pagination.Last onClick={() => this.handlePageClick(this.state.totalPageNo)} />
            </Pagination>
        )
    }

    render() {
        return (
            <Container>
                <h1 className="text-black text-uppercase text-center my-4">Expenditure app</h1>
                <Row>
                    <div className="col-md-12 col-sm-10 mx-auto p-0">
                        <div className="card p-3">
                            <table className="table table-hover">
                                {this.renderTableHeaders()}
                                {this.renderTableBody()}
                            </table>
                        </div>
                    </div>
                    {this.renderPaginationElement()}
                </Row>
                <ExpenditureModal
                    activeItem = {this.state.activeItem}
                    show = {this.state.show}
                    handleClose = {this.handleClose}
                    handleSaveItem = {this.handleSaveItem}
                />
            </Container>
        )
    }
}

const ExpenditureList = () => {
    const params = useParams()
    const { groupId } = params

    return (
      <>
        <ExpenditureListClass groupId={groupId} />
      </>
    );
  };

export default ExpenditureList