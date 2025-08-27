import type { SlabStatus, Slab } from "./inventory"

export enum AuditActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  STATUS_CHANGE = "STATUS_CHANGE",
  BULK_UPDATE = "BULK_UPDATE",
}

export interface AuditEntry {
  id: string
  slabId: string
  actionType: AuditActionType
  timestamp: Date
  userId?: string // For future multi-user support
  userName?: string // For display purposes
  changes: FieldChange[]
  metadata?: {
    reason?: string
    batchId?: string // For bulk operations
    previousStatus?: SlabStatus
    newStatus?: SlabStatus
    ipAddress?: string
    userAgent?: string
  }
}

export interface FieldChange {
  field: keyof Slab
  oldValue: any
  newValue: any
  displayName: string
}

export interface AuditSummary {
  totalEntries: number
  lastModified: Date
  createdDate: Date
  statusChanges: number
  fieldUpdates: number
  lastAction: AuditActionType
}

export interface AuditFilter {
  slabId?: string
  actionType?: AuditActionType[]
  dateFrom?: Date
  dateTo?: Date
  userId?: string
  field?: keyof Slab
}

export interface AuditQueryResult {
  entries: AuditEntry[]
  totalCount: number
  hasMore: boolean
}
