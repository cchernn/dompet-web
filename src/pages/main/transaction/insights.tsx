import { useState } from "react"
import { addDays, endOfMonth, format } from "date-fns"
import { Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { KpiCard } from "@/components/kpi-card"
import { DonutChart, type DonutChartDatum } from "@/components/charts/donut-chart"
import { TrendChart } from "@/components/charts/trend-chart"
import { LoadingState } from "@/components/loading-state"
import { formatAmount } from "@/lib/format"
import { useAsyncData } from "@/hooks/use-async-data"
import { getTransactionSummary, getTransactionTrend, type TransactionInsightsParams } from "@/api/transactions"
import type { TrendBucket, TrendPoint } from "@/api/types"

function toDonutData<T extends { total: string }>(items: T[], labelOf: (item: T) => string, maxSlices = 5): DonutChartDatum[] {
    const sorted = [...items].sort((a, b) => Number(b.total) - Number(a.total))
    const top = sorted.slice(0, maxSlices)
    const rest = sorted.slice(maxSlices)
    const data: DonutChartDatum[] = top.map((item) => ({ label: labelOf(item), value: Number(item.total) }))
    if (rest.length > 0) {
        data.push({ label: "Other", value: rest.reduce((sum, item) => sum + Number(item.total), 0), clickable: false })
    }
    return data
}

// period_start carries time, not just a date, so `new Date(...)` parses it
// correctly in local time (unlike a bare "YYYY-MM-DD" string elsewhere in
// this app, which would shift a day under UTC parsing).
function bucketDateRange(bucket: TrendBucket, point: TrendPoint): { from: string; to: string } {
    const start = new Date(point.period_start)
    const from = format(start, "yyyy-MM-dd")
    if (bucket === "day") return { from, to: from }
    if (bucket === "week") return { from, to: format(addDays(start, 6), "yyyy-MM-dd") }
    return { from, to: format(endOfMonth(start), "yyyy-MM-dd") }
}

interface TransactionInsightsProps {
    filters: TransactionInsightsParams
    onDrilldown: (patch: Partial<TransactionInsightsParams>) => void
}

export function TransactionInsights({ filters, onDrilldown }: TransactionInsightsProps) {
    const [bucket, setBucket] = useState<TrendBucket>("day")
    const filterKey = JSON.stringify(filters)

    const { data: summary, loading: summaryLoading } = useAsyncData(() => getTransactionSummary(filters), [filterKey])
    const { data: trend, loading: trendLoading } = useAsyncData(() => getTransactionTrend(bucket, filters), [filterKey, bucket])

    if (summaryLoading && !summary) return <LoadingState />
    if (!summary) return null

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="Total Income" value={formatAmount(summary.total_income)} icon={TrendingUp} valueClassName="text-green-600" />
                <KpiCard label="Total Expense" value={formatAmount(summary.total_expense)} icon={TrendingDown} valueClassName="text-red-600" />
                <KpiCard label="Net" value={formatAmount(summary.net)} icon={Wallet} />
                <KpiCard label="Transactions" value={summary.transaction_count.toLocaleString()} icon={Receipt} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DonutChart
                    title="By Category"
                    data={toDonutData(summary.by_category, (item) => item.category)}
                    onSliceClick={(label) => onDrilldown({ category: label })}
                />
                <DonutChart
                    title="By Account"
                    data={toDonutData(summary.by_account, (item) => item.account)}
                    onSliceClick={(label) => onDrilldown({ source: label })}
                />
                <DonutChart
                    title="By Budget"
                    data={toDonutData(summary.by_budget, (item) => item.budget)}
                    onSliceClick={(label) => onDrilldown({ budgets: label })}
                />
            </div>

            <TrendChart
                bucket={bucket}
                onBucketChange={setBucket}
                series={trend?.series ?? []}
                loading={trendLoading}
                onBarClick={(point) => onDrilldown(bucketDateRange(bucket, point))}
            />
        </div>
    )
}
