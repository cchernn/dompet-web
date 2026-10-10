import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { addDays, endOfMonth, format } from "date-fns"
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { KpiCard } from "@/components/kpi-card"
import { DonutChart, type DonutChartDatum } from "@/components/charts/donut-chart"
import { TrendChart } from "@/components/charts/trend-chart"
import { LoadingState } from "@/components/loading-state"
import { formatAmount } from "@/lib/format"
import { fillTrendGaps } from "@/lib/trend"
import { useAsyncData } from "@/hooks/use-async-data"
import { getBudgetSummary, getBudgetTrend } from "@/api/budgets"
import type { BudgetBreakdown, TrendBucket, TrendPoint } from "@/api/types"

function toDonutData(items: BudgetBreakdown[], maxSlices = 5): DonutChartDatum[] {
    const sorted = [...items].sort((a, b) => Number(b.total) - Number(a.total))
    const top = sorted.slice(0, maxSlices)
    const rest = sorted.slice(maxSlices)
    const data: DonutChartDatum[] = top.map((item) => ({ label: item.budget, value: Number(item.total) }))
    if (rest.length > 0) {
        data.push({ label: "Other", value: rest.reduce((sum, item) => sum + Number(item.total), 0), clickable: false })
    }
    return data
}

// period_start carries time, not just a date, so `new Date(...)` parses it
// correctly in local time.
function bucketDateRange(bucket: TrendBucket, point: TrendPoint): { from: string; to: string } {
    const start = new Date(point.period_start)
    const from = format(start, "yyyy-MM-dd")
    if (bucket === "day") return { from, to: from }
    if (bucket === "week") return { from, to: format(addDays(start, 6), "yyyy-MM-dd") }
    return { from, to: format(endOfMonth(start), "yyyy-MM-dd") }
}

export interface BudgetInsightsFilters {
    budget: string
    from: string
    to: string
}

interface BudgetInsightsProps {
    filters: BudgetInsightsFilters
    onDrilldown: (patch: Partial<BudgetInsightsFilters>) => void
}

export function BudgetInsights({ filters, onDrilldown }: BudgetInsightsProps) {
    const navigate = useNavigate()
    const [bucket, setBucket] = useState<TrendBucket>("day")
    const filterKey = `${filters.budget}|${filters.from}|${filters.to}`

    // The trend chart has no equivalent on this page (budgets aren't dated
    // themselves) — clicking a bar hands the date range (and the active
    // Budget filter, if any) over to the Transactions Insights view instead.
    const goToTransactionsInsights = (point: TrendPoint) => {
        const range = bucketDateRange(bucket, point)
        const params = new URLSearchParams({ tab: "insights", from: range.from, to: range.to })
        if (filters.budget) params.set("budgets", filters.budget)
        navigate(`/transactions?${params.toString()}`)
    }

    const { data: summary, loading: summaryLoading } = useAsyncData(
        () => getBudgetSummary({ q: filters.budget || undefined, from: filters.from || undefined, to: filters.to || undefined }),
        [filterKey]
    )
    const { data: trend, loading: trendLoading } = useAsyncData(
        () => getBudgetTrend(bucket, { from: filters.from || undefined, to: filters.to || undefined, q: filters.budget || undefined }),
        [filterKey, bucket]
    )
    const trendSeries = useMemo(
        () => fillTrendGaps(trend?.series ?? [], bucket, filters.from, filters.to),
        [trend, bucket, filters.from, filters.to]
    )

    if (summaryLoading && !summary) return <LoadingState />
    if (!summary) return null

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="Budgets" value={summary.budget_count.toLocaleString()} icon={PiggyBank} />
                <KpiCard label="Total Income" value={formatAmount(summary.total_income)} icon={TrendingUp} valueClassName="text-green-600" />
                <KpiCard label="Total Expense" value={formatAmount(summary.total_expense)} icon={TrendingDown} valueClassName="text-red-600" />
                <KpiCard label="Net" value={formatAmount(summary.net)} icon={Wallet} />
            </div>

            <DonutChart
                title="Spend Share by Budget"
                data={toDonutData(summary.by_budget)}
                onSliceClick={(label) => onDrilldown({ budget: label })}
            />

            <TrendChart
                bucket={bucket}
                onBucketChange={setBucket}
                series={trendSeries}
                loading={trendLoading}
                onBarClick={goToTransactionsInsights}
            />
        </div>
    )
}
