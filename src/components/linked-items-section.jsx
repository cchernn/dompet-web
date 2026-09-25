import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Combobox } from "@/components/ui/combobox"

// Small reusable "linked items" section: a badge list with Unlink buttons,
// plus a Combobox + Link button to attach another item. `onLink`/`onUnlink`
// are plain callbacks — they can hit the backend immediately (edit pages,
// where the parent record already exists) or just update local pending
// state (add pages, where linking happens after the parent is created).
export function LinkedItemsSection({ title, linkedItems, linkedLoading, options, comboboxPlaceholder, onLink, onUnlink, renderItemLabel, renderItemExtra }) {
    const [selected, setSelected] = useState(null)
    const excludeValues = linkedItems.map((item) => item.id)

    return (
        <div className="flex flex-col gap-2 w-full">
            <h3 className="font-semibold text-sm">{title}</h3>
            {linkedLoading ? (
                <Skeleton className="h-6 w-full" />
            ) : linkedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">None linked yet.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {linkedItems.map((item) => (
                        <Badge key={item.id} variant="secondary" className="gap-2 pr-1 items-center">
                            {renderItemLabel(item)}
                            {renderItemExtra?.(item)}
                            <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => onUnlink(item)}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            <div className="flex gap-2 items-center max-w-md">
                <Combobox
                    options={options}
                    value={selected}
                    onChange={setSelected}
                    excludeValues={excludeValues}
                    placeholder={comboboxPlaceholder}
                />
                <Button
                    type="button"
                    variant="outline"
                    disabled={!selected}
                    onClick={() => {
                        onLink(selected)
                        setSelected(null)
                    }}
                >
                    Link
                </Button>
            </div>
        </div>
    )
}
