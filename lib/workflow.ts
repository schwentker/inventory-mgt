import { SlabStatus, type Slab } from "@/types/inventory"

// Define allowed status transitions
export const STATUS_TRANSITIONS: Record<SlabStatus, SlabStatus[]> = {
  [SlabStatus.WANTED]: [SlabStatus.ORDERED],
  [SlabStatus.ORDERED]: [SlabStatus.RECEIVED, SlabStatus.WANTED], // Can cancel order
  [SlabStatus.RECEIVED]: [SlabStatus.STOCK, SlabStatus.ALLOCATED],
  [SlabStatus.STOCK]: [SlabStatus.ALLOCATED, SlabStatus.REMNANT],
  [SlabStatus.ALLOCATED]: [SlabStatus.CONSUMED, SlabStatus.STOCK], // Can deallocate
  [SlabStatus.CONSUMED]: [SlabStatus.REMNANT], // If there's leftover material
  [SlabStatus.REMNANT]: [], // Terminal state
}

// Status metadata for UI display
export const STATUS_METADATA: Record<
  SlabStatus,
  {
    label: string
    description: string
    color: string
    icon: string
    isDestructive: boolean
    requiresConfirmation: boolean
  }
> = {
  [SlabStatus.WANTED]: {
    label: "Wanted",
    description: "Slab is needed but not yet ordered",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: "search",
    isDestructive: false,
    requiresConfirmation: false,
  },
  [SlabStatus.ORDERED]: {
    label: "Ordered",
    description: "Slab has been ordered from supplier",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "shopping-cart",
    isDestructive: false,
    requiresConfirmation: false,
  },
  [SlabStatus.RECEIVED]: {
    label: "Received",
    description: "Slab has arrived and been inspected",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: "package",
    isDestructive: false,
    requiresConfirmation: false,
  },
  [SlabStatus.STOCK]: {
    label: "In Stock",
    description: "Slab is available for allocation",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: "warehouse",
    isDestructive: false,
    requiresConfirmation: false,
  },
  [SlabStatus.ALLOCATED]: {
    label: "Allocated",
    description: "Slab is reserved for a specific job",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: "bookmark",
    isDestructive: false,
    requiresConfirmation: false,
  },
  [SlabStatus.CONSUMED]: {
    label: "Consumed",
    description: "Slab has been used in production",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: "check-circle",
    isDestructive: true,
    requiresConfirmation: true,
  },
  [SlabStatus.REMNANT]: {
    label: "Remnant",
    description: "Leftover material from consumed slab",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: "scissors",
    isDestructive: false,
    requiresConfirmation: false,
  },
}

export interface StatusTransition {
  from: SlabStatus
  to: SlabStatus
  timestamp: Date
  reason?: string
  userId?: string // For future multi-user support
}

export interface WorkflowValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export class WorkflowEngine {
  /**
   * Check if a status transition is allowed
   */
  static isTransitionAllowed(from: SlabStatus, to: SlabStatus): boolean {
    return STATUS_TRANSITIONS[from]?.includes(to) ?? false
  }

  /**
   * Get all valid next statuses for a given current status
   */
  static getValidNextStatuses(currentStatus: SlabStatus): SlabStatus[] {
    return STATUS_TRANSITIONS[currentStatus] || []
  }

  /**
   * Validate a status transition with business rules
   */
  static validateTransition(
    slab: Slab,
    newStatus: SlabStatus,
    additionalData?: Partial<Slab>,
  ): WorkflowValidationResult {
    const currentStatus = slab.status

    // Check if transition is allowed
    if (!this.isTransitionAllowed(currentStatus, newStatus)) {
      return {
        isValid: false,
        error: `Cannot transition from ${currentStatus} to ${newStatus}`,
      }
    }

    const warnings: string[] = []

    // Business rule validations
    switch (newStatus) {
      case SlabStatus.RECEIVED:
        if (!additionalData?.receivedDate && !slab.receivedDate) {
          return {
            isValid: false,
            error: "Received date is required when marking slab as received",
          }
        }
        break

      case SlabStatus.ALLOCATED:
        if (!additionalData?.jobId && !slab.jobId) {
          warnings.push("Consider adding a job ID for better tracking")
        }
        break

      case SlabStatus.CONSUMED:
        if (!additionalData?.consumedDate && !slab.consumedDate) {
          return {
            isValid: false,
            error: "Consumed date is required when marking slab as consumed",
          }
        }
        if (!slab.jobId && !additionalData?.jobId) {
          warnings.push("No job ID specified for consumed slab")
        }
        break

      case SlabStatus.REMNANT:
        if (slab.slabType === "REMNANT") {
          warnings.push("Slab is already marked as remnant type")
        }
        break
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Execute a status transition with automatic timestamping
   */
  static executeTransition(
    slab: Slab,
    newStatus: SlabStatus,
    additionalData?: Partial<Slab>,
    reason?: string,
  ): { updatedSlab: Slab; transition: StatusTransition } {
    const validation = this.validateTransition(slab, newStatus, additionalData)

    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const now = new Date()
    const transition: StatusTransition = {
      from: slab.status,
      to: newStatus,
      timestamp: now,
      reason,
    }

    // Create updated slab with new status and automatic date stamping
    const updatedSlab: Slab = {
      ...slab,
      ...additionalData,
      status: newStatus,
    }

    // Automatic date stamping based on status
    switch (newStatus) {
      case SlabStatus.RECEIVED:
        if (!updatedSlab.receivedDate) {
          updatedSlab.receivedDate = now
        }
        break
      case SlabStatus.CONSUMED:
        if (!updatedSlab.consumedDate) {
          updatedSlab.consumedDate = now
        }
        break
    }

    return { updatedSlab, transition }
  }

  /**
   * Get workflow progress percentage (0-100)
   */
  static getWorkflowProgress(status: SlabStatus): number {
    const progressMap: Record<SlabStatus, number> = {
      [SlabStatus.WANTED]: 0,
      [SlabStatus.ORDERED]: 20,
      [SlabStatus.RECEIVED]: 40,
      [SlabStatus.STOCK]: 60,
      [SlabStatus.ALLOCATED]: 80,
      [SlabStatus.CONSUMED]: 100,
      [SlabStatus.REMNANT]: 100,
    }
    return progressMap[status] || 0
  }

  /**
   * Get workflow step index for visual indicators
   */
  static getWorkflowStepIndex(status: SlabStatus): number {
    const stepMap: Record<SlabStatus, number> = {
      [SlabStatus.WANTED]: 0,
      [SlabStatus.ORDERED]: 1,
      [SlabStatus.RECEIVED]: 2,
      [SlabStatus.STOCK]: 3,
      [SlabStatus.ALLOCATED]: 4,
      [SlabStatus.CONSUMED]: 5,
      [SlabStatus.REMNANT]: 5, // Same as consumed
    }
    return stepMap[status] || 0
  }

  /**
   * Get all workflow steps for progress visualization
   */
  static getWorkflowSteps(): Array<{
    status: SlabStatus
    label: string
    description: string
  }> {
    return [
      {
        status: SlabStatus.WANTED,
        label: "Wanted",
        description: "Identified need",
      },
      {
        status: SlabStatus.ORDERED,
        label: "Ordered",
        description: "Purchase order sent",
      },
      {
        status: SlabStatus.RECEIVED,
        label: "Received",
        description: "Delivered and inspected",
      },
      {
        status: SlabStatus.STOCK,
        label: "In Stock",
        description: "Available for use",
      },
      {
        status: SlabStatus.ALLOCATED,
        label: "Allocated",
        description: "Reserved for job",
      },
      {
        status: SlabStatus.CONSUMED,
        label: "Consumed",
        description: "Used in production",
      },
    ]
  }
}
