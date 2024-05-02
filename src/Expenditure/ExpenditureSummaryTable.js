import React, { Component } from "react"

class ExpenditureSummaryTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: props.title,
            dimension: props.dimension,
            data: props.data && props.data[props.dimension]
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.dimension !== this.props.dimension || prevProps.data !== this.props.data) {
            this.setState({ 
                dimension: this.props.dimension,
                data: this.props.data && this.props.data[this.props.dimension] 
            })
        }
    }

    render() {
        return (
            <>
                <div className="expenditure-summary-chart-cell-header">
                    <h3>{this.state.title} - {this.state.dimension}</h3>
                </div>
                <div className="expenditure-summary-chart-cell-table">
                    { this.state.data && (
                        <table>
                            <tbody>
                            { this.state.data.map((rowData, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="column">{rowData['name']}</td>
                                    <td className="column">{rowData['total_spend']}</td>
                                    <td className="column">{rowData['total_items']}</td>
                                </tr>
                            )
                            )}
                            </tbody>
                        </table>
                    )}
                </div>
            </>
        )
    }
}

export default ExpenditureSummaryTable