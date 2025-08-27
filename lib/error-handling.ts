"use client"

import { toast } from "@/hooks/use-toast"

export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  STORAGE = "STORAGE",
  PERMISSION = "PERMISSION",
  DATA_CORRUPTION = "DATA_CORRUPTION",
  UNKNOWN = "UNKNOWN",
}

export interface AppError extends Error {
  type: ErrorType
  code?: string
  details?: Record<string, any>
  recoverable?: boolean
}

export class NetworkError extends Error implements AppError {
  type = ErrorType.NETWORK as const
  recoverable = true

  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = "NetworkError"
  }
}

export class ValidationError extends Error implements AppError {
  type = ErrorType.VALIDATION as const
  recoverable = true

  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

export class StorageError extends Error implements AppError {
  type = ErrorType.STORAGE as const
  recoverable = true

  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = "StorageError"
  }
}

export class DataCorruptionError extends Error implements AppError {
  type = ErrorType.DATA_CORRUPTION as const
  recoverable = false

  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = "DataCorruptionError"
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: Array<{ error: AppError; timestamp: Date; context?: string }> = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  logError(error: AppError, context?: string) {
    this.errorLog.push({
      error,
      timestamp: new Date(),
      context,
    })

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }

    console.error(`[v0] ${error.type} Error:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      context,
      stack: error.stack,
    })
  }

  handleError(error: AppError, context?: string, showToast = true) {
    this.logError(error, context)

    if (showToast) {
      this.showErrorToast(error)
    }

    // Attempt recovery for recoverable errors
    if (error.recoverable) {
      this.attemptRecovery(error, context)
    }
  }

  private showErrorToast(error: AppError) {
    const getErrorMessage = (error: AppError) => {
      switch (error.type) {
        case ErrorType.NETWORK:
          return "Network connection failed. Please check your internet connection."
        case ErrorType.VALIDATION:
          return error.message || "Please check your input and try again."
        case ErrorType.STORAGE:
          return "Failed to save data. Your changes may not be preserved."
        case ErrorType.DATA_CORRUPTION:
          return "Data corruption detected. Please refresh the page."
        default:
          return "An unexpected error occurred. Please try again."
      }
    }

    toast({
      variant: error.type === ErrorType.DATA_CORRUPTION ? "destructive" : "warning",
      title: `${error.type.toLowerCase().replace("_", " ")} Error`,
      description: getErrorMessage(error),
    })
  }

  private attemptRecovery(error: AppError, context?: string) {
    switch (error.type) {
      case ErrorType.STORAGE:
        this.recoverFromStorageError(error, context)
        break
      case ErrorType.NETWORK:
        this.recoverFromNetworkError(error, context)
        break
      case ErrorType.VALIDATION:
        // Validation errors are typically handled by the form
        break
    }
  }

  private recoverFromStorageError(error: AppError, context?: string) {
    try {
      // Attempt to clear corrupted data and reinitialize
      if (context?.includes("localStorage")) {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          try {
            JSON.parse(localStorage.getItem(key) || "")
          } catch {
            localStorage.removeItem(key)
            console.log(`[v0] Removed corrupted localStorage key: ${key}`)
          }
        })
      }
    } catch (recoveryError) {
      console.error("[v0] Recovery failed:", recoveryError)
    }
  }

  private recoverFromNetworkError(error: AppError, context?: string) {
    // Implement retry logic or offline mode
    console.log("[v0] Network error recovery not implemented yet")
  }

  getErrorLog() {
    return [...this.errorLog]
  }

  clearErrorLog() {
    this.errorLog = []
  }
}

// Utility functions for common error scenarios
export function handleAsyncOperation<T>(operation: () => Promise<T>, context?: string): Promise<T> {
  return operation().catch((error) => {
    const appError =
      error instanceof Error
        ? new NetworkError(error.message, "ASYNC_OP_FAILED", { originalError: error })
        : new NetworkError("Unknown async operation error", "ASYNC_OP_FAILED")

    ErrorHandler.getInstance().handleError(appError, context)
    throw appError
  })
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === "") {
    throw new ValidationError(`${fieldName} is required`, "REQUIRED_FIELD", { fieldName })
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format", "INVALID_EMAIL", { email })
  }
}

export function validateNumber(value: any, fieldName: string, min?: number, max?: number): void {
  const num = Number(value)
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`, "INVALID_NUMBER", { fieldName, value })
  }
  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, "MIN_VALUE", { fieldName, value: num, min })
  }
  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`, "MAX_VALUE", { fieldName, value: num, max })
  }
}

// Hook for using error handling in components
export function useErrorHandler() {
  const errorHandler = ErrorHandler.getInstance()

  const handleError = (error: Error | AppError, context?: string, showToast = true) => {
    const appError =
      error instanceof Error && "type" in error
        ? (error as AppError)
        : new NetworkError(error.message, "UNKNOWN_ERROR", { originalError: error })

    errorHandler.handleError(appError, context, showToast)
  }

  const showSuccess = (message: string, title = "Success") => {
    toast({
      variant: "success",
      title,
      description: message,
    })
  }

  const showWarning = (message: string, title = "Warning") => {
    toast({
      variant: "warning",
      title,
      description: message,
    })
  }

  return {
    handleError,
    showSuccess,
    showWarning,
    getErrorLog: () => errorHandler.getErrorLog(),
    clearErrorLog: () => errorHandler.clearErrorLog(),
  }
}
