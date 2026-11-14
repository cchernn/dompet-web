import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { Statement, StatementInput, StatementPatch, StatementSearchResult, StatementStatus } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listStatements = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Statement[]>("/statements", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export interface StatementSearchParams {
    page?: number
    pageSize?: number
    q?: string
    // Matches on the exact joined account name (dompet.vw_statements), same
    // convention as the Bills list filter.
    account?: string
    accountId?: string
    isRecurring?: boolean
    status?: StatementStatus
    from?: string
    to?: string
}

// Denormalized view used by the Statements list page -- joined account
// name plus status derived from received_date/statement_date.
export const searchStatements = ({ page = 1, pageSize = 25, q, account, accountId, isRecurring, status, from, to }: StatementSearchParams = {}) =>
    apiClient.get<StatementSearchResult[]>("/statements/search", {
        page, page_size: pageSize, q, account, account_id: accountId,
        is_recurring: isRecurring, status, from, to,
    })

export const getStatement = (statementId: string) => apiClient.get<Statement>(`/statements/${statementId}`)

export const createStatement = (body: StatementInput) =>
    apiClient.post<Statement>("/statements", body).then((result) => { invalidateResource("statements"); return result })

export const updateStatement = (statementId: string, body: StatementPatch) =>
    apiClient.put<Statement>(`/statements/${statementId}`, body).then((result) => { invalidateResource("statements"); return result })

// One-way soft delete (is_active=false) -- no reactivate route exists.
export const deleteStatement = (statementId: string) =>
    apiClient.delete<Statement>(`/statements/${statementId}`).then((result) => { invalidateResource("statements"); return result })
