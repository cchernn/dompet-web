export interface Currency {
    code: string
    name: string
    symbol: string
}

// No /currencies endpoint exists on the backend, so this mirrors the seeded
// dompet.currencies rows directly (app/seeds/versions/001_seed_currencies.sql
// plus the extra codes app/scripts/firefly_migration/migrate.py ensures exist
// for migrated FX transactions). Keep in sync if the backend seeds change.
export const CURRENCIES: Currency[] = [
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    { code: "THB", name: "Thai Baht", symbol: "฿" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
]
