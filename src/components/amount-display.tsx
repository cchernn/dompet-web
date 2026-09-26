import { Plus, Minus, ArrowLeftRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CURRENCIES } from "@/lib/currencies"
import type { TransactionType } from "@/api/types"

export const AMOUNT_META: Record<TransactionType, { Icon: LucideIcon; color: string }> = {
    expenditure: { Icon: Minus, color: "text-red-600" },
    income: { Icon: Plus, color: "text-green-600" },
    transfer: { Icon: ArrowLeftRight, color: "text-blue-600" },
}

// transaction only needs {type, amount, currency} — a full Transaction /
// TransactionSearchResult row, or a partial object built from watched form
// values, both work.
export interface AmountLike {
    type: TransactionType | string
    amount: number | string
    currency: string
}

interface AmountDisplayProps {
    transaction: AmountLike
    className?: string
}

export function AmountDisplay({ transaction, className }: AmountDisplayProps) {
    const meta = AMOUNT_META[transaction.type as TransactionType] ?? { Icon: ArrowLeftRight, color: "text-muted-foreground" }
    const symbol = CURRENCIES.find((c) => c.code === transaction.currency)?.symbol ?? transaction.currency
    const amount = Number(transaction.amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return (
        <span className={cn("inline-flex items-center gap-1 font-medium tabular-nums", meta.color, className)}>
            <meta.Icon className="size-3.5" />
            {symbol} {amount}
        </span>
    )
}
