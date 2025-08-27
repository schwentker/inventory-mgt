"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { ValidationService, type ValidationResult } from "@/lib/validation"
import type { Slab } from "@/types/inventory"

interface FormFieldValidationProps {
  fieldName: keyof Slab
  value: any
  context?: Partial<Slab>
  showValidation?: boolean
  onValidationChange?: (result: ValidationResult) => void
}

export function FormFieldValidation({
  fieldName,
  value,
  context,
  showValidation = true,
  onValidationChange,
}: FormFieldValidationProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  })
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    const validateField = async () => {
      if (!showValidation) return

      setIsValidating(true)
      try {
        const result = await ValidationService.validateField(fieldName, value, context)
        setValidationResult(result)
        onValidationChange?.(result)
      } catch (error) {
        console.error("Field validation error:", error)
      } finally {
        setIsValidating(false)
      }
    }

    // Debounce validation
    const timeoutId = setTimeout(validateField, 300)
    return () => clearTimeout(timeoutId)
  }, [fieldName, value, context, showValidation, onValidationChange])

  if (!showValidation || isValidating) {
    return null
  }

  const hasErrors = validationResult.errors.length > 0
  const hasWarnings = validationResult.warnings.length > 0

  if (!hasErrors && !hasWarnings) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
        <CheckCircle className="h-3 w-3" />
        <span>Valid</span>
      </div>
    )
  }

  return (
    <div className="space-y-1 mt-1">
      {validationResult.errors.map((error, index) => (
        <div key={`error-${index}`} className="flex items-start gap-1 text-red-600 text-xs">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      ))}
      {validationResult.warnings.map((warning, index) => (
        <div key={`warning-${index}`} className="flex items-start gap-1 text-amber-600 text-xs">
          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  )
}
