import React, { Component } from "react"
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis,YAxis, Tooltip, Legend } from "recharts"

class ChartComposed extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: props.data,
            groupKey: props.groupKey,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.setState({ 
                data: this.props.data
            })
        }
    }

    render() {
        if (this.state.data && this.state.data.length > 0) {
            return (
                <ResponsiveContainer width={"100%"} height={"85%"}>
                    <ComposedChart
                        data={this.state.data}
                    >
                        <XAxis
                            dataKey={this.state.groupKey}
                            label = {{
                                value: "Date",
                                position: "insideBottomRight"
                            }}
                            scale="auto"
                        />
                        <YAxis
                            yAxisId="left"
                            label = {{
                                value: "Total Spend",
                                angle: -90,
                                position: 'insideLeft'
                            }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label = {{
                                value: "Total Items",
                                angle: 90,
                                position: 'insideRight'
                            }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar 
                            yAxisId="left"
                            dataKey="total_spend" 
                            maxBarSize={50}
                            fill="#00728F" 
                        />
                        <Line 
                            yAxisId="right"
                            dataKey="total_items"
                            type="monotone"
                            stroke="#008F88"
                            strokeWidth={0.5}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        } else {
            return (
                <div className="expenditure-chart-cell-no-data">
                    <p>No Data</p>
                </div>
            )
        }
    }
}

export default ChartComposed