import { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import type { ComboboxOption } from "@/components/ui/combobox"

const NEW_VALUE_PREFIX = "__new__:"

// A field value that doesn't match any existing option is encoded as this
// sentinel (rather than tracked in separate state) so it flows through
// react-hook-form like any other string field value.
export const isNewComboboxValue = (value?: string | null): value is string =>
    !!value && value.startsWith(NEW_VALUE_PREFIX)

export const comboboxNewValueName = (value: string): string => value.slice(NEW_VALUE_PREFIX.length)

const toNewValue = (name: string) => `${NEW_VALUE_PREFIX}${name}`

interface CreatableComboboxProps {
    options: ComboboxOption[]
    value?: string | null
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
}

// Like Combobox, but typing a name that doesn't exactly match an existing
// option (case-insensitive) is accepted as-is, encoded via the
// isNewComboboxValue sentinel above. Callers are responsible for resolving
// that sentinel into a real id (creating the record) before submitting.
export function CreatableCombobox({
    options,
    value,
    onChange,
    placeholder = "Select or type a name",
    searchPlaceholder = "Search or type a new name...",
    emptyText = "No results found.",
    disabled = false,
}: CreatableComboboxProps) {
    const [open, setOpen] = useState(false)
    const selected = options.find((option) => option.value === value)
    const isNew = isNewComboboxValue(value)
    const newName = isNew ? comboboxNewValueName(value) : ""

    const [search, setSearch] = useState(selected?.label ?? newName)
    // Re-sync the visible search text with the resolved value whenever the
    // popover isn't open — e.g. a parent clearing this field when its
    // account changes. Skipped while open so it doesn't fight live typing.
    useEffect(() => {
        if (!open) setSearch(selected?.label ?? newName)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, open])

    const handleSearchChange = (text: string) => {
        setSearch(text)
        const trimmed = text.trim()
        if (trimmed === "") {
            onChange("")
            return
        }
        const match = options.find((option) => option.label.toLowerCase() === trimmed.toLowerCase())
        onChange(match ? match.value : toNewValue(trimmed))
    }

    const visibleOptions = options.filter((option) =>
        option.label.toLowerCase().includes(search.trim().toLowerCase())
    )
    const displayLabel = selected ? selected.label : isNew ? newName : ""

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                // Re-sync on open too, not just on close — options loaded
                // after this field's value was set (e.g. while editing a
                // transaction) could otherwise leave the search box
                // showing stale/empty text the first time it's reopened.
                if (next) setSearch(selected?.label ?? newName)
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn("w-full justify-between font-normal", isNew && "border-destructive text-destructive")}
                >
                    <span className="truncate">{displayLabel || placeholder}</span>
                    <ChevronsUpDown className="opacity-50 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    <CommandInput value={search} onValueChange={handleSearchChange} placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {visibleOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value)
                                        setSearch(option.label)
                                        setOpen(false)
                                    }}
                                >
                                    <span className="truncate">{option.label}</span>
                                    <Check className={cn("ml-auto", option.value === value ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
