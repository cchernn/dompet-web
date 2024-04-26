import React, { Component } from "react"
import { useParams } from "react-router-dom"
import API from "../Services/API"   

class ExpenditureSummaryClass extends Component {
    constructor(props) {
        super(props)
        const { groupId } = props
        this.state ={
            expenditureSummary: {},
            groupId: groupId,
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
            this.setState({ expenditureSummary: res.data })
            console.log(this.state.expenditureSummary)
        })
        .catch((err) => {
            console.log("error", err)
        })
    }

    handleView = () => {
        const groupId = this.state.groupId
        window.location.href = `/expenditures/${groupId}/list`
    }

    render() {
        return (
            <section id="expenditure-summary-box" className="container">
                <h2>Expenditure Summary - {this.state.groupId}</h2>
                <div className="expenditure-summary-list">
                    <button type="button" onClick={this.handleView}>List</button>
                </div>
                <div className="expenditure-summary-cells">
                    <section className="expenditure-summary-cell">
                        <div className="expenditure-summary-cell-header">
                            <h3>Expenditure Total</h3>
                        </div>
                        <div className="expenditure-summary-cell-content">
                            { this.state.expenditureSummary.expenditure_total ? (
                                    <p>{this.state.expenditureSummary.expenditure_total.total_spend.toLocaleString()}</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                        <div className="expenditure-summary-cell-footer">
                            { this.state.expenditureSummary.expenditure_total ? (
                                    <p>{this.state.expenditureSummary.expenditure_total.total_items} transactions</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                    </section>
                    <section className="expenditure-summary-cell">
                        <div className="expenditure-summary-cell-header">
                            <h3>Expenditure MTD</h3>
                        </div>
                        <div className="expenditure-summary-cell-content">
                            { this.state.expenditureSummary.expenditure_mtd ? (
                                    <p>{this.state.expenditureSummary.expenditure_mtd.total_spend.toLocaleString()}</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                        <div className="expenditure-summary-cell-footer">
                            { this.state.expenditureSummary.expenditure_mtd ? (
                                    <p>{this.state.expenditureSummary.expenditure_mtd.total_items} transactions</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                    </section>
                    <section className="expenditure-summary-cell">
                        <div className="expenditure-summary-cell-header">
                            <h3>Expenditure YTD</h3>
                        </div>
                        <div className="expenditure-summary-cell-content">
                            { this.state.expenditureSummary.expenditure_ytd ? (
                                    <p>{this.state.expenditureSummary.expenditure_ytd.total_spend.toLocaleString()}</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
                        <div className="expenditure-summary-cell-footer">
                            { this.state.expenditureSummary.expenditure_ytd ? (
                                    <p>{this.state.expenditureSummary.expenditure_ytd.total_items} transactions</p>
                                ) : (
                                    <p>Loading..</p>
                                )
                            }
                        </div>
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