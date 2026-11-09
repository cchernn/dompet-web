import { addDays, addMonths, addWeeks, format, isAfter, parse, startOfMonth, startOfWeek } from "date-fns"
import type { TrendBucket, TrendPoint } from "@/api/types"

// Safety cap on generated buckets (e.g. ~16 years of daily buckets) in case
// of a malformed from/to pair — never meant to actually be hit.
const MAX_BUCKETS = 6000

function bucketStart(date: Date, bucket: TrendBucket): Date {
    if (bucket === "day") return date
    if (bucket === "week") return startOfWeek(date, { weekStartsOn: 1 })
    return startOfMonth(date)
}

function nextBucketStart(date: Date, bucket: TrendBucket): Date {
    if (bucket === "day") return addDays(date, 1)
    if (bucket === "week") return addWeeks(date, 1)
    return addMonths(date, 1)
}

// Mirrors the backend's bucket_label (app/utils/trend.py) so a synthetic
// zero point reads identically to a real one.
function bucketLabel(date: Date, bucket: TrendBucket): string {
    if (bucket === "day") return format(date, "d MMM")
    if (bucket === "week") return `Week of ${format(date, "MMM d")}`
    return format(date, "MMM yyyy")
}

// A key used only to match a bucket slot to a returned point — not displayed.
function bucketKey(date: Date): string {
    return format(date, "yyyy-MM-dd")
}

// The backend only returns buckets that have at least one transaction, so a
// filtered range with a gap in the middle (or at either end) comes back
// with those buckets missing entirely rather than present at zero. This
// fills every bucket between `from` and `to` (inclusive), synthesizing a
// zero-valued point for anything the backend didn't return. A missing
// from/to (an unbounded "All dates" filter) has no fixed range to fill
// against, so the real series is returned unchanged.
export function fillTrendGaps(series: TrendPoint[], bucket: TrendBucket, from?: string, to?: string): TrendPoint[] {
    if (!from || !to) return series

    const fromDate = parse(from, "yyyy-MM-dd", new Date())
    const toDate = parse(to, "yyyy-MM-dd", new Date())
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || isAfter(fromDate, toDate)) return series

    const byKey = new Map(series.map((point) => [bucketKey(bucketStart(new Date(point.period_start), bucket)), point]))

    const filled: TrendPoint[] = []
    let cursor = bucketStart(fromDate, bucket)
    const end = bucketStart(toDate, bucket)
    let guard = 0
    while (!isAfter(cursor, end) && guard < MAX_BUCKETS) {
        const key = bucketKey(cursor)
        const existing = byKey.get(key)
        filled.push(
            existing ?? {
                // Time component kept (not a bare date) so anything that later
                // does `new Date(period_start)` parses it as local time, same
                // as the backend's own naive-datetime-without-"Z" convention —
                // a bare "YYYY-MM-DD" parses as UTC and can land on the wrong day.
                period_start: `${key}T00:00:00`,
                period_label: bucketLabel(cursor, bucket),
                income: "0",
                expense: "0",
                net: "0",
                count: 0,
            }
        )
        cursor = nextBucketStart(cursor, bucket)
        guard += 1
    }
    return filled
}
