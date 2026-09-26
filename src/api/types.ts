// Domain types mirroring the dompet backend's actual response shapes
// (~/projects/dompet, app/models/*.py) — kept hand-written rather than
// generated, since there's no shared OpenAPI-to-TS pipeline yet. Field
// names/optionality here should track the backend's pydantic models.

export type TransactionType = "expenditure" | "income" | "transfer"
export type LocationType = "physical" | "online"

export interface Account {
    id: string
    code: string
    name: string
    description?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    datetime: string
    name: string
    type: TransactionType
    amount: string
    currency_code: string
    category_id?: string | null
    source_account_id: string
    destination_account_id: string
    is_active: boolean
    created_at: string
    updated_at: string
}

// Shape of a row from GET /transactions/search (vw_transactions) — distinct
// from Transaction: joined names instead of ids, no user_id/account ids,
// tags/budgets as string arrays, attachments as {id, filename} refs (no
// download_url on list results — see AttachmentRef).
export interface TransactionSearchResult {
    id: string
    date: string
    name: string
    type: TransactionType
    amount: string
    currency: string
    category?: string | null
    source: string
    destination: string
    tags: string[]
    budgets: string[]
    attachments: AttachmentRef[]
}

export interface AttachmentRef {
    id: string
    filename: string
}

export interface Category {
    id: string
    user_id?: string | null
    name: string
    parent_id?: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Location {
    id: string
    type: LocationType
    name: string
    google_maps_url?: string | null
    url?: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface AccountLocationLink {
    account_id: string
    location_id: string
    created_at: string
}

export interface Tag {
    id: string
    name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface TransactionTagLink {
    transaction_id: string
    tag_id: string
    created_at: string
}

// download_url is only ever present on a single-record fetch
// (GET /attachments/{id}) — list endpoints omit it (see
// _to_attachment_summary on the backend).
export interface Attachment {
    id: string
    filename: string
    content_type?: string | null
    size_bytes?: number | null
    download_url?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface TransactionAttachmentLink {
    transaction_id: string
    attachment_id: string
    created_at: string
}

export interface Budget {
    id: string
    name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface BudgetMember {
    budget_id: string
    user_id: string
    created_at: string
}

export interface TransactionBudgetLink {
    transaction_id: string
    budget_id: string
    created_at: string
}

// --- Request bodies -------------------------------------------------------
// Deliberately loose (not the full zod-validated shape) — these exist to
// catch field-name typos and gross shape mismatches against the backend
// contract, not to replace each page's own zod schema for value validation.

export interface AccountInput {
    code: string
    name: string
    description?: string
}
export type AccountPatch = Partial<AccountInput>

export interface TransactionInput {
    datetime: string
    name: string
    type: TransactionType
    amount: number
    currency_code: string
    category_id?: string
    source_account_id: string
    destination_account_id: string
}
export type TransactionPatch = Partial<TransactionInput>

export interface CategoryInput {
    name: string
    parent_id?: string | null
}
export type CategoryPatch = Partial<CategoryInput>

export interface LocationInput {
    type: LocationType
    name: string
    google_maps_url?: string | null
    url?: string | null
}
export type LocationPatch = Partial<LocationInput>

export interface TagInput {
    name: string
}
export type TagPatch = Partial<TagInput>

export interface AttachmentPatch {
    filename: string
}

export interface BudgetInput {
    name: string
}
export type BudgetPatch = Partial<BudgetInput>
