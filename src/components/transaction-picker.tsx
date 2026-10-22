import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { format, parse } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { searchTransactions, getTransaction } from "@/api/transactions"
import { CURRENCIES } from "@/lib/currencies"
import type { TransactionSearchResult } from "@/api/types"

interface TransactionPickerProps {
    value?: string | null
    onChange: (transactionId: string | null) => void
    placeholder?: string
    disabled?: boolean
}

const formatAmount = (amount: string, currencyCode: string) =>
    `${CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? currencyCode} ${parseFloat(amount).toFixed(2)}`

const resultLabel = (tx: TransactionSearchResult) =>
    `${tx.name} — ${format(parse(tx.date, "yyyy-MM-dd", new Date()), "d MMM yyyy")} — ${formatAmount(tx.amount, tx.currency)}`

// Transactions aren't preloaded as a static option list anywhere (there can
// be thousands) -- this searches /transactions/search live and debounced,
// unlike the Combobox component which filters an already-fetched list.
export function TransactionPicker({ value, onChange, placeholder = "Link a transaction", disabled = false }: TransactionPickerProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<TransactionSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        setLoading(true)
        const timeout = setTimeout(() => {
            searchTransactions({ q: search || undefined, pageSize: 50 })
                .then(({ data }) => setResults(data))
                .catch(() => setResults([]))
                .finally(() => setLoading(false))
        }, 300)
        return () => clearTimeout(timeout)
    }, [search, open])

    // Only the id is known when `value` comes from an existing payment --
    // resolve it to a readable label via the plain GET (not search, which
    // has no by-id lookup).
    useEffect(() => {
        if (!value) {
            setSelectedLabel(null)
            return
        }
        const fromResults = results.find((r) => r.id === value)
        if (fromResults) {
            setSelectedLabel(resultLabel(fromResults))
            return
        }
        getTransaction(value)
            .then(({ data }) => setSelectedLabel(`${data.name} — ${format(new Date(data.datetime), "d MMM yyyy")} — ${formatAmount(data.amount, data.currency_code)}`))
            .catch(() => setSelectedLabel(value))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    title={selectedLabel ?? undefined}
                    className="w-full justify-between font-normal"
                >
                    <span className="truncate">{selectedLabel ?? placeholder}</span>
                    <ChevronsUpDown className="opacity-50 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
                <Command shouldFilter={false}>
                    <CommandInput placeholder="Search by name" value={search} onValueChange={setSearch} />
                    <CommandList>
                        <CommandEmpty>{loading ? "Searching…" : "No transactions found."}</CommandEmpty>
                        <CommandGroup>
                            {value && (
                                <CommandItem
                                    value="__unlink__"
                                    onSelect={() => {
                                        onChange(null)
                                        setOpen(false)
                                    }}
                                >
                                    <X className="mr-1" />Unlink transaction
                                </CommandItem>
                            )}
                            {results.map((tx) => (
                                <CommandItem
                                    key={tx.id}
                                    value={tx.id}
                                    title={resultLabel(tx)}
                                    onSelect={() => {
                                        onChange(tx.id)
                                        setOpen(false)
                                    }}
                                >
                                    <span className="truncate">{resultLabel(tx)}</span>
                                    <Check className={cn("ml-auto shrink-0", tx.id === value ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
