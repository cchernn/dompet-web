// Domain types mirroring the dompet backend's actual response shapes
// (~/projects/dompet, app/models/*.py) — kept hand-written rather than
// generated, since there's no shared OpenAPI-to-TS pipeline yet. Field
// names/optionality here should track the backend's pydantic models.

export type TransactionType = "expenditure" | "income" | "transfer"
export type LocationType = "physical" | "online"
export type NotificationType = "success" | "error" | "warning" | "info"

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
    datetime: string
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

// Shapes from the */search endpoints (GET /accounts/search, /categories/search,
// /tags/search, /budgets/search — dompet.vw_* views) used to populate filter
// dropdowns. Distinct from the plain resource models: no is_active/timestamps
// (the view is pre-filtered to active rows only), plus a computed usage_count
// the view orders by (usage_count DESC, name ASC) so common picks sort first.
// These four resources' search endpoints also accept a raised page-size
// ceiling (1000, vs. the normal list endpoints' 100) so a dropdown can fetch
// every row in one call — locations/attachments search does NOT get this
// raised ceiling (they stay typeahead-only, per the backend).
export interface AccountSearchResult {
    id: string
    code: string
    name: string
    description?: string | null
    usage_count: number
}

export interface CategorySearchResult {
    id: string
    name: string
    parent_id?: string | null
    usage_count: number
}

export interface TagSearchResult {
    id: string
    name: string
    usage_count: number
}

export interface BudgetSearchResult {
    id: string
    name: string
    usage_count: number
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

export interface Notification {
    id: string
    user_id: string
    type: NotificationType
    message: string
    description?: string | null
    entity_type?: string | null
    entity_id?: string | null
    is_read: boolean
    created_at: string
}

export interface NotificationInput {
    type: NotificationType
    message: string
    description?: string
    entity_type?: string
    entity_id?: string
}
