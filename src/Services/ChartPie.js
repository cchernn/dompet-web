import React, { Component } from "react"
import { ResponsiveContainer, PieChart, Pie, Sector } from "recharts"

const renderActiveShape = (props, groupKey) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    const fill = "#00728F"

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload[groupKey]}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload[groupKey]}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#333">{`${value.toLocaleString()}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );  
}

class ChartPie extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: props.data,
            dataKey: "total_spend",
            activeIndex: 0,
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

    onPieEnter = (_, index) => {
        this.setState({ 
            activeIndex: index
        })
    }

    onPieSelect = (_, index) => {
        this.props.onIndexChange( this.props.data[index][this.state.groupKey], this.state.groupKey )
    }

    render() {
        if (this.state.data && this.state.data.length > 0) {
            return (
                <ResponsiveContainer className="w-100">
                    <PieChart>
                        <Pie
                            data={this.state.data}
                            cx="50%"
                            cy="40%"
                            fill="#008F88"
                            innerRadius={60}
                            outerRadius={90}
                            dataKey={this.state.dataKey}
                            activeIndex={this.state.activeIndex}
                            activeShape={(props) => renderActiveShape(props, this.state.groupKey)}
                            onMouseEnter={this.onPieEnter}
                            onClick={this.onPieSelect}
                        >
                        </Pie>
                    </PieChart>
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

export default ChartPie