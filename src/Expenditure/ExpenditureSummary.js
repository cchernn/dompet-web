import React, { Component } from "react"
import { useParams } from "react-router-dom"
import API from "../Services/API"
import ChartPie from "../Services/ChartPie"
import ExpenditureSummaryTable from "./ExpenditureSummaryTable"

class ExpenditureSummaryClass extends Component {
    constructor(props) {
        super(props)
        const { groupId } = props
        this.state ={
            expenditureSummary: {},
            groupId: groupId,
            categoryIndex: "",
            userIndex: "",
            selectMode: "default",
            error: "",
        }
    }

    componentDidMount() {
        this.refreshSummary()
    }

    refreshSummary = async () => {
        const groupId = this.state.groupId

        await API.request(
            'get',
            `/expendituregroups/${groupId}/summary`,
            {}
        )
        .then((res) => {
            this.setState({ 
                expenditureSummary: res.data,
                categoryIndex: res.data.expenditure_by_category[0].category,
                userIndex: res.data.expenditure_by_user[0].user
            })
        })
        .catch((err) => {
            console.log("error", err)
        })
    }

    handleView = (value) => {
        const groupId = this.state.groupId
        if (value == "historical") {
            window.location.href = `/expenditures/${groupId}/historical`
        } else if (value == "list") {
            window.location.href = `/expenditures/${groupId}/list`
        }

    }

    handleSelectIndex = (index, dimension) => {
        if (dimension === "category") {
            this.setState({ categoryIndex: index }) 
        } else if (dimension === "user") {
            this.setState({ userIndex: index })
        }
    }

    handleSelectMode = (value) => {
        this.setState({ selectMode: value })
    }

    render() {
        let data_category
        let data_category_breakdown
        let data_user
        let data_user_breakdown

        switch (this.state.selectMode) {
            case "mtd":
                data_category = this.state.expenditureSummary.expenditure_by_category_mtd
                data_category_breakdown = this.state.expenditureSummary.expenditure_by_category_breakdown_mtd
                data_user = this.state.expenditureSummary.expenditure_by_user_mtd
                data_user_breakdown = this.state.expenditureSummary.expenditure_by_user_breakdown_mtd
                break
            case "ytd":
                data_category = this.state.expenditureSummary.expenditure_by_category_ytd
                data_category_breakdown = this.state.expenditureSummary.expenditure_by_category_breakdown_ytd
                data_user = this.state.expenditureSummary.expenditure_by_user_ytd
                data_user_breakdown = this.state.expenditureSummary.expenditure_by_user_breakdown_ytd
                break
            default:
                data_category = this.state.expenditureSummary.expenditure_by_category
                data_category_breakdown = this.state.expenditureSummary.expenditure_by_category_breakdown
                data_user = this.state.expenditureSummary.expenditure_by_user
                data_user_breakdown = this.state.expenditureSummary.expenditure_by_user_breakdown
        }

        return (
            <section id="expenditure-summary-box" className="container">
                <h2>Expenditure Summary - {this.state.groupId}</h2>
                <div className="expenditure-summary-list">
                    <button type="button" onClick={() => this.handleView("historical")}>Historical</button>
                    <button type="button" onClick={() => this.handleView("list")}>List</button>
                </div>
                <div className="expenditure-summary-cells">
                    <section className="expenditure-summary-value-cell" onClick={() => this.handleSelectMode("default")}>
                        <div className="expenditure-summary-value-cell-header">
                            <h3>Expenditure Total</h3>
                        </div>
                        <div className="expenditure-summary-value-cell-content">
                            { this.state.expenditureSummary.expenditure_total ? (
                                    <p>{this.state.expenditureSummary.expenditure_total.total_spend.toLocaleString()}</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                        <div className="expenditure-summary-value-cell-footer">
                            { this.state.expenditureSummary.expenditure_total ? (
                                    <p>{this.state.expenditureSummary.expenditure_total.total_items} transactions</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                    </section>
                    <section className="expenditure-summary-value-cell" onClick={() => this.handleSelectMode("mtd")}>
                        <div className="expenditure-summary-value-cell-header">
                            <h3>Expenditure MTD</h3>
                        </div>
                        <div className="expenditure-summary-value-cell-content">
                            { this.state.expenditureSummary.expenditure_mtd ? (
                                    <p>{this.state.expenditureSummary.expenditure_mtd.total_spend.toLocaleString()}</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                        <div className="expenditure-summary-value-cell-footer">
                            { this.state.expenditureSummary.expenditure_mtd ? (
                                    <p>{this.state.expenditureSummary.expenditure_mtd.total_items} transactions</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                    </section>
                    <section className="expenditure-summary-value-cell" onClick={() => this.handleSelectMode("ytd")}>
                        <div className="expenditure-summary-value-cell-header">
                            <h3>Expenditure YTD</h3>
                        </div>
                        <div className="expenditure-summary-value-cell-content">
                            { this.state.expenditureSummary.expenditure_ytd ? (
                                    <p>{this.state.expenditureSummary.expenditure_ytd.total_spend.toLocaleString()}</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                        <div className="expenditure-summary-value-cell-footer">
                            { this.state.expenditureSummary.expenditure_ytd ? (
                                    <p>{this.state.expenditureSummary.expenditure_ytd.total_items} transactions</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                    </section>
                </div>
                <div className="expenditure-summary-chart-cells">
                    <section className="expenditure-summary-chart-cell">
                        <div className="expenditure-summary-chart-cell-header">
                            <h3>Expenditure By Category</h3>
                        </div>
                        <ChartPie
                            data={data_category}
                            dataKey="total_spend"
                            groupKey="category"
                            onIndexChange={this.handleSelectIndex}
                        />
                    </section>
                    <section className="expenditure-summary-chart-cell">
                        <ExpenditureSummaryTable 
                            title="Expenditure by Category"
                            dimension={this.state.categoryIndex}
                            data={data_category_breakdown}
                        />
                    </section>
                    <section className="expenditure-summary-chart-cell">
                        <div className="expenditure-summary-chart-cell-header">
                            <h3>Expenditure By User</h3>
                        </div>
                        <ChartPie
                            data={data_user}
                            dataKey="total_spend"
                            groupKey="user"
                            onIndexChange={this.handleSelectIndex}
                        />
                    </section>
                    <section className="expenditure-summary-chart-cell">
                        <ExpenditureSummaryTable 
                            title="Expenditure by User"
                            dimension={this.state.userIndex}
                            data={data_user_breakdown}
                        />
                    </section>
                </div>
            </section>
        )
    }
}

const ExpenditureSummary = () => {
    const params = useParams()
    const { groupId } = params

    return (
      <>
        <ExpenditureSummaryClass groupId={groupId} />
      </>
    );
  };

export default ExpenditureSummary