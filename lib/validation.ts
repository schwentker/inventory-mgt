// Comprehensive validation utilities for inventory data
import type { Slab, Material, Supplier, SlabStatus } from "@/types/inventory"
import type { BusinessRules } from "@/types/config"
import { ConfigService } from "./config"
import { InventoryRepository } from "./repository"

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export class ValidationService {
  private static businessRules: BusinessRules | null = null

  private static async getBusinessRules(): Promise<BusinessRules> {
    if (!this.businessRules) {
      try {
        const config = await ConfigService.loadConfig()
        this.businessRules = config.businessRules
      } catch (error) {
        // Fallback to default rules if config fails
        this.businessRules = {
          minSlabThickness: 10,
          maxSlabThickness: 50,
          minSlabLength: 1000,
          maxSlabLength: 4000,
          minSlabWidth: 500,
          maxSlabWidth: 2000,
          requireSerialNumber: true,
          allowNegativeCost: false,
          autoGenerateSerialNumber: true,
          defaultSlabStatus: "STOCK" as SlabStatus,
          defaultLocation: "Warehouse A",
        }
      }
    }
    return this.businessRules
  }

  // Slab validation
  static async validateSlab(slab: Partial<Slab>, businessRules?: BusinessRules): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const rules = businessRules || (await this.getBusinessRules())

    // Required fields validation
    if (!slab.serialNumber || slab.serialNumber.trim() === "") {
      if (rules.requireSerialNumber) {
        errors.push({
          field: "serialNumber",
          message: "Serial number is required",
          code: "REQUIRED_FIELD",
        })
      }
    } else {
      // Serial number format validation
      if (!/^[A-Z0-9-]+$/i.test(slab.serialNumber)) {
        errors.push({
          field: "serialNumber",
          message: "Serial number can only contain letters, numbers, and hyphens",
          code: "INVALID_FORMAT",
        })
      }

      // Length validation
      if (slab.serialNumber.length < 3) {
        errors.push({
          field: "serialNumber",
          message: "Serial number must be at least 3 characters long",
          code: "MIN_LENGTH",
        })
      }

      if (slab.serialNumber.length > 20) {
        errors.push({
          field: "serialNumber",
          message: "Serial number cannot exceed 20 characters",
          code: "MAX_LENGTH",
        })
      }
    }

    if (!slab.material || slab.material.trim() === "") {
      errors.push({
        field: "material",
        message: "Material is required",
        code: "REQUIRED_FIELD",
      })
    }

    if (!slab.color || slab.color.trim() === "") {
      errors.push({
        field: "color",
        message: "Color is required",
        code: "REQUIRED_FIELD",
      })
    }

    if (!slab.supplier || slab.supplier.trim() === "") {
      errors.push({
        field: "supplier",
        message: "Supplier is required",
        code: "REQUIRED_FIELD",
      })
    }

    // Dimension validation
    if (typeof slab.thickness === "number") {
      if (slab.thickness < rules.minSlabThickness) {
        errors.push({
          field: "thickness",
          message: `Thickness must be at least ${rules.minSlabThickness}mm`,
          code: "MIN_VALUE",
        })
      }
      if (slab.thickness > rules.maxSlabThickness) {
        errors.push({
          field: "thickness",
          message: `Thickness cannot exceed ${rules.maxSlabThickness}mm`,
          code: "MAX_VALUE",
        })
      }
    } else {
      errors.push({
        field: "thickness",
        message: "Thickness is required and must be a number",
        code: "REQUIRED_FIELD",
      })
    }

    if (typeof slab.length === "number") {
      if (slab.length <= 0) {
        errors.push({
          field: "length",
          message: "Length must be greater than 0",
          code: "MIN_VALUE",
        })
      } else if (slab.length < rules.minSlabLength) {
        warnings.push({
          field: "length",
          message: `Length is below recommended minimum of ${rules.minSlabLength}mm`,
          code: "BELOW_RECOMMENDED",
        })
      }
      if (slab.length > rules.maxSlabLength) {
        warnings.push({
          field: "length",
          message: `Length exceeds typical maximum of ${rules.maxSlabLength}mm`,
          code: "ABOVE_TYPICAL",
        })
      }
    } else {
      errors.push({
        field: "length",
        message: "Length is required and must be a number",
        code: "REQUIRED_FIELD",
      })
    }

    if (typeof slab.width === "number") {
      if (slab.width <= 0) {
        errors.push({
          field: "width",
          message: "Width must be greater than 0",
          code: "MIN_VALUE",
        })
      } else if (slab.width < rules.minSlabWidth) {
        warnings.push({
          field: "width",
          message: `Width is below recommended minimum of ${rules.minSlabWidth}mm`,
          code: "BELOW_RECOMMENDED",
        })
      }
      if (slab.width > rules.maxSlabWidth) {
        warnings.push({
          field: "width",
          message: `Width exceeds typical maximum of ${rules.maxSlabWidth}mm`,
          code: "ABOVE_TYPICAL",
        })
      }
    } else {
      errors.push({
        field: "width",
        message: "Width is required and must be a number",
        code: "REQUIRED_FIELD",
      })
    }

    // Cost validation
    if (typeof slab.cost === "number") {
      if (!rules.allowNegativeCost && slab.cost < 0) {
        errors.push({
          field: "cost",
          message: "Cost cannot be negative",
          code: "NEGATIVE_VALUE",
        })
      }
      if (slab.cost === 0) {
        warnings.push({
          field: "cost",
          message: "Cost is zero - please verify this is correct",
          code: "ZERO_COST",
        })
      }
      if (slab.cost > 50000) {
        warnings.push({
          field: "cost",
          message: "Cost is unusually high - please verify",
          code: "HIGH_COST",
        })
      }
    }

    // Date validation
    if (slab.receivedDate) {
      const receivedDate = new Date(slab.receivedDate)
      const now = new Date()

      if (isNaN(receivedDate.getTime())) {
        errors.push({
          field: "receivedDate",
          message: "Invalid date format",
          code: "INVALID_DATE",
        })
      } else {
        if (receivedDate > now) {
          warnings.push({
            field: "receivedDate",
            message: "Received date is in the future",
            code: "FUTURE_DATE",
          })
        }

        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(now.getFullYear() - 2)

        if (receivedDate < twoYearsAgo) {
          warnings.push({
            field: "receivedDate",
            message: "Received date is more than 2 years ago",
            code: "OLD_DATE",
          })
        }
      }
    }

    if (slab.consumedDate) {
      const consumedDate = new Date(slab.consumedDate)
      const now = new Date()

      if (isNaN(consumedDate.getTime())) {
        errors.push({
          field: "consumedDate",
          message: "Invalid date format",
          code: "INVALID_DATE",
        })
      } else {
        if (consumedDate > now) {
          errors.push({
            field: "consumedDate",
            message: "Consumed date cannot be in the future",
            code: "FUTURE_DATE",
          })
        }

        if (slab.receivedDate) {
          const receivedDate = new Date(slab.receivedDate)
          if (consumedDate < receivedDate) {
            errors.push({
              field: "consumedDate",
              message: "Consumed date cannot be before received date",
              code: "INVALID_DATE_ORDER",
            })
          }
        }
      }
    }

    // Status-specific validation
    if (slab.status === "CONSUMED" && !slab.consumedDate) {
      warnings.push({
        field: "consumedDate",
        message: "Consumed slabs should have a consumed date",
        code: "MISSING_CONSUMED_DATE",
      })
    }

    if (slab.status === "ALLOCATED" && !slab.jobId) {
      warnings.push({
        field: "jobId",
        message: "Allocated slabs should have a job ID",
        code: "MISSING_JOB_ID",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Material validation
  static validateMaterial(material: Partial<Material>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!material.name || material.name.trim() === "") {
      errors.push({
        field: "name",
        message: "Material name is required",
        code: "REQUIRED_FIELD",
      })
    }

    if (!material.category || material.category.trim() === "") {
      errors.push({
        field: "category",
        message: "Category is required",
        code: "REQUIRED_FIELD",
      })
    }

    if (!material.colors || material.colors.length === 0) {
      errors.push({
        field: "colors",
        message: "At least one color must be specified",
        code: "REQUIRED_FIELD",
      })
    }

    if (!material.defaultThickness || material.defaultThickness.length === 0) {
      errors.push({
        field: "defaultThickness",
        message: "At least one default thickness must be specified",
        code: "REQUIRED_FIELD",
      })
    } else {
      // Validate thickness values
      const invalidThickness = material.defaultThickness.find((t) => t <= 0 || t > 100)
      if (invalidThickness) {
        errors.push({
          field: "defaultThickness",
          message: "Thickness values must be between 1 and 100mm",
          code: "INVALID_RANGE",
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Supplier validation
  static validateSupplier(supplier: Partial<Supplier>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!supplier.name || supplier.name.trim() === "") {
      errors.push({
        field: "name",
        message: "Supplier name is required",
        code: "REQUIRED_FIELD",
      })
    }

    if (!supplier.contact || supplier.contact.trim() === "") {
      errors.push({
        field: "contact",
        message: "Contact name is required",
        code: "REQUIRED_FIELD",
      })
    }

    // Email validation
    if (supplier.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(supplier.email)) {
        errors.push({
          field: "email",
          message: "Invalid email format",
          code: "INVALID_FORMAT",
        })
      }
    } else {
      warnings.push({
        field: "email",
        message: "Email address is recommended for better communication",
        code: "MISSING_RECOMMENDED",
      })
    }

    // Phone validation
    if (supplier.phone) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(supplier.phone.replace(/[\s\-$$$$]/g, ""))) {
        errors.push({
          field: "phone",
          message: "Invalid phone number format",
          code: "INVALID_FORMAT",
        })
      }
    } else {
      warnings.push({
        field: "phone",
        message: "Phone number is recommended for better communication",
        code: "MISSING_RECOMMENDED",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Batch validation
  static async validateSlabBatch(slabs: Partial<Slab>[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    for (const slab of slabs) {
      const result = await this.validateSlab(slab)
      results.push(result)
    }

    return results
  }

  // Utility methods
  static hasErrors(result: ValidationResult): boolean {
    return result.errors.length > 0
  }

  static hasWarnings(result: ValidationResult): boolean {
    return result.warnings.length > 0
  }

  static getErrorMessages(result: ValidationResult): string[] {
    return result.errors.map((error) => error.message)
  }

  static getWarningMessages(result: ValidationResult): string[] {
    return result.warnings.map((warning) => warning.message)
  }

  static getFieldErrors(result: ValidationResult, field: string): ValidationError[] {
    return result.errors.filter((error) => error.field === field)
  }

  static getFieldWarnings(result: ValidationResult, field: string): ValidationWarning[] {
    return result.warnings.filter((warning) => warning.field === field)
  }

  static async validateField(
    fieldName: keyof Slab,
    value: any,
    context?: Partial<Slab>,
    businessRules?: BusinessRules,
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const rules = businessRules || (await this.getBusinessRules())

    switch (fieldName) {
      case "serialNumber":
        if (!value || value.trim() === "") {
          if (rules.requireSerialNumber) {
            errors.push({
              field: "serialNumber",
              message: "Serial number is required",
              code: "REQUIRED_FIELD",
            })
          }
        } else {
          // Serial number format validation
          if (!/^[A-Z0-9-]+$/i.test(value)) {
            errors.push({
              field: "serialNumber",
              message: "Serial number can only contain letters, numbers, and hyphens",
              code: "INVALID_FORMAT",
            })
          }

          // Length validation
          if (value.length < 3) {
            errors.push({
              field: "serialNumber",
              message: "Serial number must be at least 3 characters long",
              code: "MIN_LENGTH",
            })
          }

          if (value.length > 20) {
            errors.push({
              field: "serialNumber",
              message: "Serial number cannot exceed 20 characters",
              code: "MAX_LENGTH",
            })
          }
        }
        break

      case "material":
        if (!value || value.trim() === "") {
          errors.push({
            field: "material",
            message: "Material is required",
            code: "REQUIRED_FIELD",
          })
        }
        break

      case "color":
        if (!value || value.trim() === "") {
          errors.push({
            field: "color",
            message: "Color is required",
            code: "REQUIRED_FIELD",
          })
        }
        break

      case "supplier":
        if (!value || value.trim() === "") {
          errors.push({
            field: "supplier",
            message: "Supplier is required",
            code: "REQUIRED_FIELD",
          })
        }
        break

      case "thickness":
        if (typeof value !== "number" || isNaN(value)) {
          errors.push({
            field: "thickness",
            message: "Thickness must be a valid number",
            code: "INVALID_TYPE",
          })
        } else {
          if (value < rules.minSlabThickness) {
            errors.push({
              field: "thickness",
              message: `Thickness must be at least ${rules.minSlabThickness}mm`,
              code: "MIN_VALUE",
            })
          }
          if (value > rules.maxSlabThickness) {
            errors.push({
              field: "thickness",
              message: `Thickness cannot exceed ${rules.maxSlabThickness}mm`,
              code: "MAX_VALUE",
            })
          }
        }
        break

      case "length":
        if (typeof value !== "number" || isNaN(value)) {
          errors.push({
            field: "length",
            message: "Length must be a valid number",
            code: "INVALID_TYPE",
          })
        } else {
          if (value <= 0) {
            errors.push({
              field: "length",
              message: "Length must be greater than 0",
              code: "MIN_VALUE",
            })
          } else if (value < rules.minSlabLength) {
            warnings.push({
              field: "length",
              message: `Length is below recommended minimum of ${rules.minSlabLength}mm`,
              code: "BELOW_RECOMMENDED",
            })
          }
          if (value > rules.maxSlabLength) {
            warnings.push({
              field: "length",
              message: `Length exceeds typical maximum of ${rules.maxSlabLength}mm`,
              code: "ABOVE_TYPICAL",
            })
          }
        }
        break

      case "width":
        if (typeof value !== "number" || isNaN(value)) {
          errors.push({
            field: "width",
            message: "Width must be a valid number",
            code: "INVALID_TYPE",
          })
        } else {
          if (value <= 0) {
            errors.push({
              field: "width",
              message: "Width must be greater than 0",
              code: "MIN_VALUE",
            })
          } else if (value < rules.minSlabWidth) {
            warnings.push({
              field: "width",
              message: `Width is below recommended minimum of ${rules.minSlabWidth}mm`,
              code: "BELOW_RECOMMENDED",
            })
          }
          if (value > rules.maxSlabWidth) {
            warnings.push({
              field: "width",
              message: `Width exceeds typical maximum of ${rules.maxSlabWidth}mm`,
              code: "ABOVE_TYPICAL",
            })
          }
        }
        break

      case "cost":
        if (typeof value === "number") {
          if (!rules.allowNegativeCost && value < 0) {
            errors.push({
              field: "cost",
              message: "Cost cannot be negative",
              code: "NEGATIVE_VALUE",
            })
          }
          if (value === 0) {
            warnings.push({
              field: "cost",
              message: "Cost is zero - please verify this is correct",
              code: "ZERO_COST",
            })
          }
          if (value > 50000) {
            warnings.push({
              field: "cost",
              message: "Cost is unusually high - please verify",
              code: "HIGH_COST",
            })
          }
        }
        break

      case "receivedDate":
        if (value) {
          const receivedDate = new Date(value)
          const now = new Date()

          if (isNaN(receivedDate.getTime())) {
            errors.push({
              field: "receivedDate",
              message: "Invalid date format",
              code: "INVALID_DATE",
            })
          } else {
            if (receivedDate > now) {
              warnings.push({
                field: "receivedDate",
                message: "Received date is in the future",
                code: "FUTURE_DATE",
              })
            }

            const twoYearsAgo = new Date()
            twoYearsAgo.setFullYear(now.getFullYear() - 2)

            if (receivedDate < twoYearsAgo) {
              warnings.push({
                field: "receivedDate",
                message: "Received date is more than 2 years ago",
                code: "OLD_DATE",
              })
            }
          }
        }
        break

      case "consumedDate":
        if (value) {
          const consumedDate = new Date(value)
          const now = new Date()

          if (isNaN(consumedDate.getTime())) {
            errors.push({
              field: "consumedDate",
              message: "Invalid date format",
              code: "INVALID_DATE",
            })
          } else {
            if (consumedDate > now) {
              errors.push({
                field: "consumedDate",
                message: "Consumed date cannot be in the future",
                code: "FUTURE_DATE",
              })
            }

            if (context?.receivedDate) {
              const receivedDate = new Date(context.receivedDate)
              if (consumedDate < receivedDate) {
                errors.push({
                  field: "consumedDate",
                  message: "Consumed date cannot be before received date",
                  code: "INVALID_DATE_ORDER",
                })
              }
            }
          }
        }
        break

      case "jobId":
        if (value && typeof value === "string") {
          if (value.length > 50) {
            errors.push({
              field: "jobId",
              message: "Job ID cannot exceed 50 characters",
              code: "MAX_LENGTH",
            })
          }

          // Job ID format validation (alphanumeric with hyphens and underscores)
          if (!/^[A-Z0-9_-]+$/i.test(value)) {
            warnings.push({
              field: "jobId",
              message: "Job ID should only contain letters, numbers, hyphens, and underscores",
              code: "RECOMMENDED_FORMAT",
            })
          }
        }
        break

      case "location":
        if (value && typeof value === "string") {
          if (value.length > 100) {
            errors.push({
              field: "location",
              message: "Location cannot exceed 100 characters",
              code: "MAX_LENGTH",
            })
          }
        }
        break

      case "notes":
        if (value && typeof value === "string") {
          if (value.length > 1000) {
            errors.push({
              field: "notes",
              message: "Notes cannot exceed 1000 characters",
              code: "MAX_LENGTH",
            })
          }
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static async validateUniqueSerialNumber(serialNumber: string, excludeId?: string): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    try {
      const repository = new InventoryRepository()

      const existingSlab = await repository.getSlabBySerialNumber(serialNumber)

      if (existingSlab && existingSlab.id !== excludeId) {
        errors.push({
          field: "serialNumber",
          message: `Serial number "${serialNumber}" is already in use`,
          code: "DUPLICATE_SERIAL",
        })
      }
    } catch (error) {
      console.error("Error validating unique serial number:", error)
      // Don't fail validation if we can't check uniqueness
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    }
  }

  static async validateSlabForm(
    formData: Partial<Slab>,
    mode: "create" | "edit" = "create",
    existingSlabId?: string,
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const rules = await this.getBusinessRules()

    // Run basic slab validation
    const basicValidation = await this.validateSlab(formData, rules)
    errors.push(...basicValidation.errors)
    warnings.push(...basicValidation.warnings)

    // Unique serial number validation
    if (formData.serialNumber) {
      const uniqueValidation = await this.validateUniqueSerialNumber(
        formData.serialNumber,
        mode === "edit" ? existingSlabId : undefined,
      )
      errors.push(...uniqueValidation.errors)
    }

    // Cross-field validation
    if (formData.length && formData.width) {
      const area = (formData.length * formData.width) / 1000000 // Convert to m²

      if (area < 0.1) {
        warnings.push({
          field: "dimensions",
          message: "Slab area is very small (less than 0.1 m²)",
          code: "SMALL_AREA",
        })
      }

      if (area > 10) {
        warnings.push({
          field: "dimensions",
          message: "Slab area is unusually large (over 10 m²)",
          code: "LARGE_AREA",
        })
      }
    }

    // Status-specific validation
    if (formData.status === "ALLOCATED" && !formData.jobId) {
      warnings.push({
        field: "jobId",
        message: "Job ID is recommended for allocated slabs",
        code: "MISSING_RECOMMENDED",
      })
    }

    if (formData.status === "CONSUMED") {
      if (!formData.consumedDate) {
        errors.push({
          field: "consumedDate",
          message: "Consumed date is required for consumed slabs",
          code: "REQUIRED_FOR_STATUS",
        })
      }

      if (!formData.jobId) {
        warnings.push({
          field: "jobId",
          message: "Job ID is recommended for consumed slabs",
          code: "MISSING_RECOMMENDED",
        })
      }
    }

    if (formData.status === "RECEIVED" && !formData.receivedDate) {
      warnings.push({
        field: "receivedDate",
        message: "Received date is recommended for received slabs",
        code: "MISSING_RECOMMENDED",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static getValidationSummary(result: ValidationResult): {
    hasErrors: boolean
    hasWarnings: boolean
    errorCount: number
    warningCount: number
    summary: string
  } {
    const errorCount = result.errors.length
    const warningCount = result.warnings.length

    let summary = ""
    if (errorCount > 0 && warningCount > 0) {
      summary = `${errorCount} error${errorCount > 1 ? "s" : ""} and ${warningCount} warning${warningCount > 1 ? "s" : ""} found`
    } else if (errorCount > 0) {
      summary = `${errorCount} error${errorCount > 1 ? "s" : ""} found`
    } else if (warningCount > 0) {
      summary = `${warningCount} warning${warningCount > 1 ? "s" : ""} found`
    } else {
      summary = "Validation passed"
    }

    return {
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
      errorCount,
      warningCount,
      summary,
    }
  }

  static async validateBusinessRuleCompliance(slab: Partial<Slab>): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const rules = await this.getBusinessRules()

    // Check if dimensions are within business rules
    if (slab.thickness && (slab.thickness < rules.minSlabThickness || slab.thickness > rules.maxSlabThickness)) {
      errors.push({
        field: "thickness",
        message: `Thickness must be between ${rules.minSlabThickness}mm and ${rules.maxSlabThickness}mm`,
        code: "BUSINESS_RULE_VIOLATION",
      })
    }

    if (slab.length && slab.length < rules.minSlabLength) {
      warnings.push({
        field: "length",
        message: `Length is below business minimum of ${rules.minSlabLength}mm`,
        code: "BUSINESS_RULE_WARNING",
      })
    }

    if (slab.width && slab.width < rules.minSlabWidth) {
      warnings.push({
        field: "width",
        message: `Width is below business minimum of ${rules.minSlabWidth}mm`,
        code: "BUSINESS_RULE_WARNING",
      })
    }

    // Check cost rules
    if (slab.cost !== undefined && !rules.allowNegativeCost && slab.cost < 0) {
      errors.push({
        field: "cost",
        message: "Negative costs are not allowed by business rules",
        code: "BUSINESS_RULE_VIOLATION",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }
}
