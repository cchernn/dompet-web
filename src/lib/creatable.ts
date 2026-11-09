import { createAccount } from "@/api/accounts"
import { createLocation } from "@/api/locations"
import { linkLocation } from "@/api/accountLocations"
import { isNewComboboxValue, comboboxNewValueName } from "@/components/ui/creatable-combobox"

// Resolves a CreatableCombobox account field value to a real account id,
// creating the account first if the user typed a name with no match.
export async function resolveAccountId(value: string): Promise<string> {
    if (!isNewComboboxValue(value)) return value
    const { data } = await createAccount({ name: comboboxNewValueName(value) })
    return data.id
}

// Same for a location field value — new locations default to "physical"
// (no sensible default exists server-side, unlike accounts) and must be
// linked to the leg's own account, same as any other account location.
export async function resolveLocationId(value: string | null | undefined, accountId: string): Promise<string | null> {
    if (!value) return null
    if (!isNewComboboxValue(value)) return value
    const { data: location } = await createLocation({ name: comboboxNewValueName(value), type: "physical" })
    await linkLocation(accountId, location.id)
    return location.id
}
