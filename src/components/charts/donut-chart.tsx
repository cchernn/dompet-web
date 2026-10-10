import { Cell, Pie, PieChart } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatAmount } from "@/lib/format"

const SLICE_COLORS = [1, 2, 3, 4, 5].map((n) => `hsl(var(--chart-${n}))`)

export interface DonutChartDatum {
    label: string
    value: number
    // false for synthetic aggregates (e.g. "Other") that don't map to a
    // single filterable value — onSliceClick is skipped for these.
    clickable?: boolean
}

interface DonutChartProps {
    title: string
    data: DonutChartDatum[]
    emptyText?: string
    onSliceClick?: (label: string) => void
}

export function DonutChart({ title, data, emptyText = "No data for these filters", onSliceClick }: DonutChartProps) {
    const hasData = data.some((d) => d.value > 0)
    return (
        <Card className="p-4 rounded-2xl shadow-md border">
            <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>
            {hasData ? (
                <ChartContainer config={{}} className="mx-auto aspect-square max-h-56">
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    nameKey="label"
                                    formatter={(value, name) => (
                                        <div className="flex w-full justify-between gap-2">
                                            <span className="text-muted-foreground">{name}</span>
                                            <span className="font-mono font-medium tabular-nums">{formatAmount(value as number)}</span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="label"
                            innerRadius={50}
                            outerRadius={80}
                            strokeWidth={2}
                            onClick={
                                onSliceClick
                                    ? (entry: { payload?: DonutChartDatum }) => {
                                        const datum = entry?.payload
                                        if (datum && datum.clickable !== false) onSliceClick(datum.label)
                                    }
                                    : undefined
                            }
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                                    style={{ cursor: onSliceClick && entry.clickable !== false ? "pointer" : "default" }}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            ) : (
                <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">{emptyText}</div>
            )}
        </Card>
    )
}
