// Domain types mirroring the dompet backend's actual response shapes
// (~/projects/dompet, app/models/*.py) — kept hand-written rather than
// generated, since there's no shared OpenAPI-to-TS pipeline yet. Field
// names/optionality here should track the backend's pydantic models.

export type TransactionType = "expenditure" | "income" | "transfer"
export type LocationType = "physical" | "online"
export type NotificationType = "success" | "error" | "warning" | "info"
export type AccountType = "bank" | "wallet" | "merchant" | "online" | "utility" | "subscription" | "other"

export interface Account {
    id: string
    // Owner (Cognito sub). Plain-model reads include it; compare to the current user to gate edits.
    user_id?: string | null
    code: string
    name: string
    description?: string
    type: AccountType
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    // Owner (Cognito sub). Plain-model reads include it; compare to the current user to gate edits.
    user_id?: string | null
    datetime: string
    name: string
    type: TransactionType
    amount: string
    currency_code: string
    category_id?: string | null
    source_account_id: string
    destination_account_id: string
    // Each independently must already be linked (via account_locations) to
    // its own leg's account — not a free-standing/global picker, and not
    // mutually exclusive (a location can be valid for both legs at once).
    source_location_id?: string | null
    destination_location_id?: string | null
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
    user_id: string
    // Resolved from the owner's public profile (dompet.vw_users_public) —
    // null if that user hasn't created one yet. Prefer these over user_id
    // for anything shown on screen (e.g. whose transaction this is in a
    // shared budget) — user_id itself is never displayed, only compared.
    username?: string | null
    display_name?: string | null
    date: string
    datetime: string
    name: string
    type: TransactionType
    amount: string
    currency: string
    category?: string | null
    source: string
    destination: string
    // Joined location names only — no ids. If an id is ever needed (e.g. to
    // preselect it in an edit form), it must come from a separate
    // GET /transactions/{id} call (plain Transaction model), not this one.
    source_location?: string | null
    destination_location?: string | null
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
// (the view is pre-filtered to active rows only), plus a computed
// transaction_count the view orders by (transaction_count DESC, name ASC) so
// common picks sort first. These four resources' search endpoints also accept
// a raised page-size ceiling (1000, vs. the normal list endpoints' 100) so a
// dropdown can fetch every row in one call — locations/attachments search
// does NOT get this raised ceiling (they stay typeahead-only, per the backend).
export interface AccountSearchResult {
    id: string
    code: string
    name: string
    description?: string | null
    transaction_count: number
    type: AccountType
    // Accounts can link to more than one location (e.g. a wallet usable at
    // several physical branches) — a count, not a single location name.
    location_count: number
}

export interface CategorySearchResult {
    id: string
    name: string
    parent_id?: string | null
    transaction_count: number
    // null = global/shared (visible to everyone, immutable through the app);
    // a real id = owned by that user, normal CRUD applies.
    user_id?: string | null
    // Resolved from the owner's public profile — null for global categories,
    // or if the owner hasn't created a profile yet.
    username?: string | null
    display_name?: string | null
}

export interface TagSearchResult {
    id: string
    name: string
    transaction_count: number
}

export interface BudgetSearchResult {
    id: string
    name: string
    transaction_count: number
    owner_user_id: string
    // Resolved from the owner's public profile — null if they haven't
    // created one yet.
    owner_username?: string | null
    owner_display_name?: string | null
    // Usernames of this budget's members (not including the owner),
    // ordered by when they joined — a null entry is a member who hasn't
    // created a profile yet. No display_name available for these (the
    // view only resolves username here).
    members: (string | null)[]
    // Datetime of the most recently linked transaction (what the list is
    // now sorted by, DESC) — not the budget row's own updated_at, and null
    // if the budget has no transactions.
    last_updated?: string | null
}

export interface LocationSearchResult {
    id: string
    name: string
    type: LocationType
    // Number of accounts linked to this location — search still orders by
    // this (DESC, name ASC), preserving the original dropdown-popularity intent.
    account_count: number
    // Number of transactions at this location (as source or destination).
    transaction_count: number
    // null = public/shared (read-only through the app, see Location.user_id);
    // a real id = private to that user, normal CRUD applies.
    user_id?: string | null
    // Resolved from the owner's public profile — null for public/shared
    // locations, or if the owner hasn't created a profile yet.
    username?: string | null
    display_name?: string | null
}

// vw_attachments has no download_url (that's only ever generated for a
// single GET /attachments/{id}, not eagerly for a list).
export interface AttachmentSearchResult {
    id: string
    filename: string
    content_type?: string | null
    size_bytes?: number | null
    created_at: string
    transaction_count: number
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
    // null = public/shared (visible to everyone, but per the backend's
    // current RLS policies cannot be edited or deleted through the app —
    // only read); a real id = private to that user, normal CRUD applies.
    user_id?: string | null
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
    // Owner (Cognito sub). Plain-model reads include it; compare to the current user to gate edits.
    user_id?: string | null
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
    // Owner (Cognito sub). Plain-model reads include it; compare to the current user to gate edits.
    user_id?: string | null
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
    // Owner (Cognito sub). Plain-model reads include it; compare to the current user to gate edits.
    user_id?: string | null
    name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface BudgetMember {
    budget_id: string
    // Cognito UUID — internal identifier, never shown in the UI; prefer
    // username/display_name for anything displayed.
    user_id: string
    // null if the member hasn't created a user profile yet.
    username?: string | null
    display_name?: string | null
    created_at: string
}

export interface TransactionBudgetLink {
    transaction_id: string
    budget_id: string
    created_at: string
}

// id is the same Cognito sub used as user_id everywhere else — there's no
// separate surrogate key. Only GET/PUT /users/me returns this full shape
// (including configuration) — there's no endpoint to look up another
// user's profile directly; usernames only ever surface already-resolved,
// as username/display_name fields on other resources (see e.g.
// TransactionSearchResult, BudgetMember above).
export interface User {
    id: string
    username: string
    display_name?: string | null
    // Short-lived presigned S3 GET URL, regenerated on every read — null if
    // no picture has been uploaded. Don't cache/persist this across reloads.
    avatar_url?: string | null
    configuration: Record<string, unknown>
    created_at: string
    updated_at: string
}

// POST /users and PUT /users/me return this instead of a flat User — unlike
// a plain GET, a create/edit call can also request a new avatar upload (via
// avatar_content_type on the request), so the response hands back a
// presigned PUT url alongside the updated profile.
export interface UserProfileResult {
    user: User
    avatar_upload_url: string | null
}

// --- Request bodies -------------------------------------------------------
// Deliberately loose (not the full zod-validated shape) — these exist to
// catch field-name typos and gross shape mismatches against the backend
// contract, not to replace each page's own zod schema for value validation.

export interface AccountInput {
    // Optional — the backend auto-generates one from `name` if omitted.
    code?: string
    name: string
    description?: string
    // Optional — defaults to "other" server-side if omitted.
    type?: AccountType
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
    source_location_id?: string | null
    destination_location_id?: string | null
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
    // Create-only — the backend doesn't support changing visibility via
    // update. Defaults to false (private to the creator) if omitted.
    is_public?: boolean
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

export interface UserInput {
    // 3-30 chars, letters/numbers/underscore only (enforced server-side) — the
    // public handle other users address this account by. Unrelated to the
    // Cognito sign-in username, which is the account's email.
    username: string
    display_name?: string | null
    configuration?: Record<string, unknown>
    // Set to request a presigned upload URL for a new avatar (restricted
    // server-side to image/png|jpeg|webp|gif) — stored at a fixed
    // profiles/{user_id}/avatar key, so a new upload just overwrites the old one.
    avatar_content_type?: string
}
export type UserPatch = Partial<UserInput>
