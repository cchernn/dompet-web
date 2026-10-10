// Shared money formatting for the insights views — backend amounts are
// Decimal-as-string (same convention as Transaction.amount), and these
// endpoints return no currency code, so this renders a plain number.
export function formatAmount(value: string | number): string {
    return Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}
