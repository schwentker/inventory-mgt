"use client"

import { useState, useCallback } from "react"
import { ValidationError, validateRequired, validateNumber } from "@/lib/error-handling"

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule
}

export interface ValidationErrors {
  [fieldName: string]: string
}

export function useFormValidation<T extends Record<string, any>>(initialValues: T, validationRules: FieldValidation) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const rules = validationRules[fieldName]
      if (!rules) return null

      try {
        // Required validation
        if (rules.required) {
          validateRequired(value, fieldName)
        }

        // Skip other validations if field is empty and not required
        if (!rules.required && (value === "" || value === null || value === undefined)) {
          return null
        }

        // Number validation
        if (typeof value === "number" || (typeof value === "string" && !isNaN(Number(value)))) {
          validateNumber(value, fieldName, rules.min, rules.max)
        }

        // Pattern validation
        if (rules.pattern && typeof value === "string") {
          if (!rules.pattern.test(value)) {
            throw new ValidationError(`${fieldName} format is invalid`, "INVALID_FORMAT", { fieldName, value })
          }
        }

        // Custom validation
        if (rules.custom) {
          const customError = rules.custom(value)
          if (customError) {
            throw new ValidationError(customError, "CUSTOM_VALIDATION", { fieldName, value })
          }
        }

        return null
      } catch (error) {
        if (error instanceof ValidationError) {
          return error.message
        }
        return "Validation failed"
      }
    },
    [validationRules],
  )

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validateField, validationRules])

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }))

      // Validate field if it has been touched
      if (touched[fieldName]) {
        const error = validateField(fieldName, value)
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error || "",
        }))
      }
    },
    [touched, validateField],
  )

  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }))

      const error = validateField(fieldName, values[fieldName])
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || "",
      }))
    },
    [values, validateField],
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const hasErrors = Object.values(errors).some((error) => error !== "")

  return {
    values,
    errors,
    touched,
    hasErrors,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    resetForm,
    setValues,
  }
}

// Component for displaying field errors
export function FieldError({ error }: { error?: string }) {
  if (!error) return null

  return (
    <p className="text-sm text-red-600 mt-1" role="alert">
      {error}
    </p>
  )
}

// Component for displaying form-level errors
export function FormErrors({ errors }: { errors: ValidationErrors }) {
  const errorList = Object.entries(errors).filter(([_, error]) => error !== "")

  if (errorList.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4" role="alert">
      <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
      <ul className="text-sm text-red-700 space-y-1">
        {errorList.map(([field, error]) => (
          <li key={field}>• {error}</li>
        ))}
      </ul>
    </div>
  )
}
