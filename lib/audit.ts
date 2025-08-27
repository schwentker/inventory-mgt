import type { Slab } from "@/types/inventory"
import type {
  AuditEntry,
  AuditActionType,
  FieldChange,
  AuditFilter,
  AuditQueryResult,
  AuditSummary,
} from "@/types/audit"

export class AuditService {
  private static readonly STORAGE_KEY = "inventory_audit_log"
  private static readonly MAX_ENTRIES_PER_SLAB = 100

  /**
   * Get all audit entries from localStorage
   */
  private static getAuditEntries(): AuditEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const entries = JSON.parse(stored) as AuditEntry[]
      // Convert timestamp strings back to Date objects
      return entries.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }))
    } catch (error) {
      console.error("Failed to load audit entries:", error)
      return []
    }
  }

  /**
   * Save audit entries to localStorage
   */
  private static saveAuditEntries(entries: AuditEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries))
    } catch (error) {
      console.error("Failed to save audit entries:", error)
    }
  }

  /**
   * Compare two slab objects and return field changes
   */
  private static getFieldChanges(oldSlab: Partial<Slab>, newSlab: Partial<Slab>): FieldChange[] {
    const changes: FieldChange[] = []
    const fieldDisplayNames: Record<keyof Slab, string> = {
      id: "ID",
      serialNumber: "Serial Number",
      material: "Material",
      color: "Color",
      thickness: "Thickness",
      length: "Length",
      width: "Width",
      supplier: "Supplier",
      status: "Status",
      slabType: "Slab Type",
      jobId: "Job ID",
      receivedDate: "Received Date",
      consumedDate: "Consumed Date",
      notes: "Notes",
      cost: "Cost",
      location: "Location",
    }

    // Check each field for changes
    Object.keys(fieldDisplayNames).forEach((key) => {
      const field = key as keyof Slab
      const oldValue = oldSlab[field]
      const newValue = newSlab[field]

      // Handle different value types
      if (this.valuesAreDifferent(oldValue, newValue)) {
        changes.push({
          field,
          oldValue: this.formatValueForDisplay(oldValue),
          newValue: this.formatValueForDisplay(newValue),
          displayName: fieldDisplayNames[field],
        })
      }
    })

    return changes
  }

  /**
   * Check if two values are different, handling various data types
   */
  private static valuesAreDifferent(oldValue: any, newValue: any): boolean {
    // Handle null/undefined
    if (oldValue == null && newValue == null) return false
    if (oldValue == null || newValue == null) return true

    // Handle dates
    if (oldValue instanceof Date && newValue instanceof Date) {
      return oldValue.getTime() !== newValue.getTime()
    }
    if (oldValue instanceof Date || newValue instanceof Date) {
      return new Date(oldValue).getTime() !== new Date(newValue).getTime()
    }

    // Handle arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue)
    }

    // Handle objects
    if (typeof oldValue === "object" && typeof newValue === "object") {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue)
    }

    // Handle primitives
    return oldValue !== newValue
  }

  /**
   * Format values for display in audit log
   */
  private static formatValueForDisplay(value: any): string {
    if (value == null) return "—"
    if (value instanceof Date) return value.toLocaleDateString()
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (typeof value === "number") return value.toString()
    if (Array.isArray(value)) return value.join(", ")
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  /**
   * Create an audit entry for slab creation
   */
  static createSlabAudit(slab: Slab, userId?: string, userName?: string): void {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      slabId: slab.id,
      actionType: "CREATE" as AuditActionType,
      timestamp: new Date(),
      userId,
      userName: userName || "System",
      changes: [],
      metadata: {
        reason: "Slab created",
      },
    }

    this.addAuditEntry(entry)
  }

  /**
   * Create an audit entry for slab updates
   */
  static updateSlabAudit(oldSlab: Slab, newSlab: Slab, reason?: string, userId?: string, userName?: string): void {
    const changes = this.getFieldChanges(oldSlab, newSlab)

    if (changes.length === 0) return // No changes to audit

    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      slabId: newSlab.id,
      actionType: "UPDATE" as AuditActionType,
      timestamp: new Date(),
      userId,
      userName: userName || "System",
      changes,
      metadata: {
        reason: reason || "Slab updated",
      },
    }

    this.addAuditEntry(entry)
  }

  /**
   * Create an audit entry for status changes
   */
  static statusChangeAudit(
    slab: Slab,
    oldStatus: string,
    newStatus: string,
    reason?: string,
    userId?: string,
    userName?: string,
  ): void {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      slabId: slab.id,
      actionType: "STATUS_CHANGE" as AuditActionType,
      timestamp: new Date(),
      userId,
      userName: userName || "System",
      changes: [
        {
          field: "status",
          oldValue: oldStatus,
          newValue: newStatus,
          displayName: "Status",
        },
      ],
      metadata: {
        reason: reason || "Status changed",
        previousStatus: oldStatus as any,
        newStatus: newStatus as any,
      },
    }

    this.addAuditEntry(entry)
  }

  /**
   * Create an audit entry for slab deletion
   */
  static deleteSlabAudit(slab: Slab, reason?: string, userId?: string, userName?: string): void {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      slabId: slab.id,
      actionType: "DELETE" as AuditActionType,
      timestamp: new Date(),
      userId,
      userName: userName || "System",
      changes: [],
      metadata: {
        reason: reason || "Slab deleted",
      },
    }

    this.addAuditEntry(entry)
  }

  /**
   * Create audit entries for bulk operations
   */
  static bulkUpdateAudit(
    slabs: Slab[],
    changes: Partial<Slab>,
    reason?: string,
    userId?: string,
    userName?: string,
  ): void {
    const batchId = crypto.randomUUID()

    slabs.forEach((slab) => {
      const fieldChanges = this.getFieldChanges(slab, { ...slab, ...changes })

      if (fieldChanges.length > 0) {
        const entry: AuditEntry = {
          id: crypto.randomUUID(),
          slabId: slab.id,
          actionType: "BULK_UPDATE" as AuditActionType,
          timestamp: new Date(),
          userId,
          userName: userName || "System",
          changes: fieldChanges,
          metadata: {
            reason: reason || "Bulk update",
            batchId,
          },
        }

        this.addAuditEntry(entry)
      }
    })
  }

  /**
   * Add an audit entry and manage storage limits
   */
  private static addAuditEntry(entry: AuditEntry): void {
    const entries = this.getAuditEntries()
    entries.unshift(entry) // Add to beginning for chronological order

    // Limit entries per slab to prevent storage bloat
    const slabEntries = entries.filter((e) => e.slabId === entry.slabId)
    if (slabEntries.length > this.MAX_ENTRIES_PER_SLAB) {
      // Remove oldest entries for this slab
      const entriesToRemove = slabEntries.slice(this.MAX_ENTRIES_PER_SLAB)
      const filteredEntries = entries.filter(
        (e) => e.slabId !== entry.slabId || !entriesToRemove.some((r) => r.id === e.id),
      )
      this.saveAuditEntries(filteredEntries)
    } else {
      this.saveAuditEntries(entries)
    }
  }

  /**
   * Get audit history for a specific slab
   */
  static getSlabHistory(slabId: string, limit?: number): AuditEntry[] {
    const entries = this.getAuditEntries()
    const slabEntries = entries.filter((entry) => entry.slabId === slabId)

    return limit ? slabEntries.slice(0, limit) : slabEntries
  }

  /**
   * Query audit entries with filters
   */
  static queryAuditEntries(filter: AuditFilter, page = 1, pageSize = 50): AuditQueryResult {
    let entries = this.getAuditEntries()

    // Apply filters
    if (filter.slabId) {
      entries = entries.filter((entry) => entry.slabId === filter.slabId)
    }

    if (filter.actionType && filter.actionType.length > 0) {
      entries = entries.filter((entry) => filter.actionType!.includes(entry.actionType))
    }

    if (filter.dateFrom) {
      entries = entries.filter((entry) => entry.timestamp >= filter.dateFrom!)
    }

    if (filter.dateTo) {
      entries = entries.filter((entry) => entry.timestamp <= filter.dateTo!)
    }

    if (filter.userId) {
      entries = entries.filter((entry) => entry.userId === filter.userId)
    }

    if (filter.field) {
      entries = entries.filter((entry) => entry.changes.some((change) => change.field === filter.field))
    }

    // Pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedEntries = entries.slice(startIndex, endIndex)

    return {
      entries: paginatedEntries,
      totalCount: entries.length,
      hasMore: endIndex < entries.length,
    }
  }

  /**
   * Get audit summary for a slab
   */
  static getSlabAuditSummary(slabId: string): AuditSummary | null {
    const entries = this.getSlabHistory(slabId)

    if (entries.length === 0) return null

    const statusChanges = entries.filter((entry) => entry.actionType === "STATUS_CHANGE").length
    const fieldUpdates = entries.filter((entry) => entry.actionType === "UPDATE").length

    return {
      totalEntries: entries.length,
      lastModified: entries[0].timestamp,
      createdDate: entries[entries.length - 1].timestamp,
      statusChanges,
      fieldUpdates,
      lastAction: entries[0].actionType,
    }
  }

  /**
   * Export audit log for a slab
   */
  static exportSlabAuditLog(slabId: string): string {
    const entries = this.getSlabHistory(slabId)
    const lines = ["Timestamp,Action,User,Field,Old Value,New Value,Reason"]

    entries.forEach((entry) => {
      if (entry.changes.length === 0) {
        lines.push(
          `${entry.timestamp.toISOString()},${entry.actionType},${entry.userName || "System"},,,,${entry.metadata?.reason || ""}`,
        )
      } else {
        entry.changes.forEach((change) => {
          lines.push(
            `${entry.timestamp.toISOString()},${entry.actionType},${entry.userName || "System"},${change.displayName},"${change.oldValue}","${change.newValue}",${entry.metadata?.reason || ""}`,
          )
        })
      }
    })

    return lines.join("\n")
  }

  /**
   * Clear audit history (for maintenance)
   */
  static clearAuditHistory(slabId?: string): void {
    if (slabId) {
      const entries = this.getAuditEntries()
      const filteredEntries = entries.filter((entry) => entry.slabId !== slabId)
      this.saveAuditEntries(filteredEntries)
    } else {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  /**
   * Get recent activity across all slabs
   */
  static getRecentActivity(limit = 20): AuditEntry[] {
    const entries = this.getAuditEntries()
    return entries.slice(0, limit)
  }
}
