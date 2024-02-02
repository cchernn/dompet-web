import React, { Component } from "react"
import { FiPlusCircle } from "react-icons/fi"
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
            // currency: "Currency",
            type: "Type",
            // payment_method: "Payment Method",
            // username: "User",
            category: "Category",
            // attachment: "Attachment",
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
        const groupId = this.state.groupId
        window.location.href = `/expenditures/${groupId}/create`
    }

    editItem = (item) => {
        const groupId = this.state.groupId
        window.location.href = `/expenditures/${groupId}/${item.id}`
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
                    <tr key={rowIndex} onClick={() => this.editItem(rowData)}>
                        {Object.entries(rowData).map(([cellKey, cellValue], cellIndex) => {
                            if (Object.keys(this.headers).includes(cellKey)) {
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
        const totalPageNo = this.state.totalPageNo
        
        const lowerPageNo = Math.max(1, this.state.activePageNo - 2)
        const upperPageNo = Math.min(totalPageNo, this.state.activePageNo + 2)

        const pages = []
        for (let count = lowerPageNo; count <= upperPageNo; count++ ) {
            pages.push(
                <button 
                    key={count} 
                    id="expenditure-pagination-pageNo"
                    onClick={() => this.handlePageClick(count)}
                >
                    {count}
                </button>
            )
        }

        return (
            <div className="expenditure-pagination">
                <button id="expenditure-pagination-firstPage" onClick={() => this.handlePageClick(1)}>&laquo; First</button>
                {pages}
                <button id="expenditure-pagination-lastPage" onClick={() => this.handlePageClick(this.state.totalPageNo)}>Last &raquo;</button>
            </div>
        )
    }

    render() {
        return (
            <section id="expenditure-list-box" className="container">
                <h2>Expenditure List - {this.state.groupId}</h2>
                <div className="expenditure-list-add">
                    <button id="expenditure-list-create-btn" type="button" onClick={this.createItem}><FiPlusCircle /> New</button>
                </div>
                <div className="table-container">
                    <table className="table">
                        {this.renderTableHeaders()}
                        {this.renderTableBody()}
                    </table>
                </div>
                {this.renderPaginationElement()}
            </section>
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