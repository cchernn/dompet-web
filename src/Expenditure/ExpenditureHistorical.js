import React, { Component } from "react"
import { useParams } from "react-router-dom"
import API from "../Services/API"
import ChartComposed from "../Services/ChartComposed"

class ExpenditureHistoricalClass extends Component {
    constructor(props) {
        super(props)
        const { groupId } = props
        this.state ={
            expenditureHistoricalMonthly: {},
            expenditureHistoricalDaily: {},
            groupId: groupId,
            error: "",
        }
    }

    componentDidMount() {
        this.refreshHistorical()
    }

    refreshHistorical = async () => {
        const groupId = this.state.groupId

        await API.request(
            'get',
            `/expendituregroups/${groupId}/historical`,
            {}
        )
        .then((res) => {
            this.setState({ 
                expenditureHistoricalMonthly: res.data.expenditure_monthly,
                expenditureHistoricalDaily: res.data.expenditure_daily,
            })
        })
        .catch((err) => {
            console.log("error", err)
        })
    }

    handleView = (value) => {
        const groupId = this.state.groupId
        if (value === "summary") {
            window.location.href = `/expenditures/${groupId}/summary`
        } else if (value === "list") {
            window.location.href = `/expenditures/${groupId}/list`
        }
    }

    render() {
        return (
            <section id="expenditure-historical-box" className="container">
                <h2>Expenditure Summary - {this.state.groupId}</h2>
                <div className="expenditure-historical-list">
                    <button type="button" onClick={() => this.handleView("summary")}>Summary</button>
                    <button type="button" onClick={() => this.handleView("list")}>List</button>
                </div>
                <div className="expenditure-historical-cells">
                    <section className="expenditure-historical-chart-cell">
                        <div className="expenditure-historical-chart-cell-header">
                            <h3>Expenditure By Category</h3>
                        </div>
                        <ChartComposed
                            data={this.state.expenditureHistoricalMonthly}
                            groupKey="year_month"
                        />
                    </section>
                    <section className="expenditure-historical-chart-cell">
                        <div className="expenditure-historical-chart-cell-header">
                            <h3>Expenditure By Category</h3>
                        </div>
                        <ChartComposed
                            data={this.state.expenditureHistoricalDaily}
                            groupKey="date"
                        />
                    </section>
                </div>
            </section>
        )
    }
}

const ExpenditureHistorical = () => {
    const params = useParams()
    const { groupId } = params

    return (
      <>
        <ExpenditureHistoricalClass groupId={groupId} />
      </>
    );
  };

export default ExpenditureHistorical