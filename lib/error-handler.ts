// Centralized error handling utilities
export enum ErrorType {
  VALIDATION = "VALIDATION",
  STORAGE = "STORAGE",
  NETWORK = "NETWORK",
  PERMISSION = "PERMISSION",
  BUSINESS_RULE = "BUSINESS_RULE",
  UNKNOWN = "UNKNOWN",
}

export interface AppError {
  type: ErrorType
  message: string
  code: string
  details?: any
  timestamp: Date
  stack?: string
}

export class ErrorHandler {
  private static errors: AppError[] = []
  private static maxErrors = 100

  static createError(type: ErrorType, message: string, code: string, details?: any, originalError?: Error): AppError {
    const error: AppError = {
      type,
      message,
      code,
      details,
      timestamp: new Date(),
      stack: originalError?.stack,
    }

    this.logError(error)
    return error
  }

  static logError(error: AppError): void {
    // Add to error history
    this.errors.unshift(error)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    // Console logging with appropriate level
    const logMessage = `[${error.type}] ${error.message} (${error.code})`

    switch (error.type) {
      case ErrorType.VALIDATION:
        console.warn("[v0]", logMessage, error.details)
        break
      case ErrorType.BUSINESS_RULE:
        console.warn("[v0]", logMessage, error.details)
        break
      case ErrorType.STORAGE:
      case ErrorType.NETWORK:
      case ErrorType.PERMISSION:
        console.error("[v0]", logMessage, error.details)
        break
      default:
        console.error("[v0]", logMessage, error.details)
    }
  }

  static getRecentErrors(count = 10): AppError[] {
    return this.errors.slice(0, count)
  }

  static clearErrors(): void {
    this.errors = []
  }

  static getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter((error) => error.type === type)
  }

  // Helper methods for common error scenarios
  static handleValidationError(field: string, message: string, details?: any): AppError {
    return this.createError(ErrorType.VALIDATION, `Validation failed for ${field}: ${message}`, "VALIDATION_ERROR", {
      field,
      ...details,
    })
  }

  static handleStorageError(operation: string, originalError: Error): AppError {
    return this.createError(
      ErrorType.STORAGE,
      `Storage operation failed: ${operation}`,
      "STORAGE_ERROR",
      { operation },
      originalError,
    )
  }

  static handleBusinessRuleError(rule: string, message: string, details?: any): AppError {
    return this.createError(
      ErrorType.BUSINESS_RULE,
      `Business rule violation: ${rule} - ${message}`,
      "BUSINESS_RULE_ERROR",
      { rule, ...details },
    )
  }

  static handleNetworkError(url: string, originalError: Error): AppError {
    return this.createError(
      ErrorType.NETWORK,
      `Network request failed: ${url}`,
      "NETWORK_ERROR",
      { url },
      originalError,
    )
  }
}

// Async error wrapper utility
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorType: ErrorType,
  errorMessage: string,
  errorCode: string,
): Promise<{ success: boolean; data?: T; error?: AppError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (originalError) {
    const error = ErrorHandler.createError(
      errorType,
      errorMessage,
      errorCode,
      undefined,
      originalError instanceof Error ? originalError : new Error(String(originalError)),
    )
    return { success: false, error }
  }
}
