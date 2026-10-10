import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LoadingState } from "@/components/loading-state"
import { formatAmount } from "@/lib/format"
import type { TrendBucket, TrendPoint } from "@/api/types"

const BUCKET_LABELS: Record<TrendBucket, string> = { day: "Day", week: "Week", month: "Month" }

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: TrendPoint }[]; label?: string }) {
    if (!active || !payload?.length) return null
    const point = payload[0].payload
    return (
        <div className="grid min-w-[9rem] gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">{label}</div>
            <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Income</span>
                <span className="font-mono tabular-nums text-green-600">{formatAmount(point.income)}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Expense</span>
                <span className="font-mono tabular-nums text-red-600">{formatAmount(point.expense)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t pt-1">
                <span className="text-muted-foreground">Net</span>
                <span className="font-mono font-medium tabular-nums">{formatAmount(point.net)}</span>
            </div>
        </div>
    )
}

interface TrendChartProps {
    bucket: TrendBucket
    onBucketChange: (bucket: TrendBucket) => void
    series: TrendPoint[]
    loading?: boolean
    onBarClick?: (point: TrendPoint) => void
}

export function TrendChart({ bucket, onBucketChange, series, loading, onBarClick }: TrendChartProps) {
    return (
        <Card className="p-4 rounded-2xl shadow-md border">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Net Over Time</div>
                <div className="flex gap-1">
                    {(Object.entries(BUCKET_LABELS) as [TrendBucket, string][]).map(([value, label]) => (
                        <Button
                            key={value}
                            type="button"
                            size="sm"
                            variant={bucket === value ? "default" : "outline"}
                            onClick={() => onBucketChange(value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>
            {loading ? (
                <LoadingState />
            ) : series.length > 0 ? (
                <ChartContainer config={{}} className="aspect-auto h-64 w-full">
                    <BarChart data={series}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="period_label" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(value) => formatAmount(value)} />
                        <ChartTooltip content={<TrendTooltip />} />
                        <Bar
                            dataKey="net"
                            radius={4}
                            onClick={onBarClick ? (data: { payload?: TrendPoint }) => data?.payload && onBarClick(data.payload) : undefined}
                        >
                            {series.map((point, index) => (
                                <Cell
                                    key={index}
                                    fill={Number(point.net) >= 0 ? "hsl(142 71% 45%)" : "hsl(0 72% 51%)"}
                                    style={{ cursor: onBarClick ? "pointer" : "default" }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">No data for these filters</div>
            )}
        </Card>
    )
}
