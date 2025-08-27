"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { ValidationService, type ValidationResult } from "@/lib/validation"

interface ValidationSummaryProps {
  validationResult: ValidationResult
  showDetails?: boolean
  className?: string
}

export function ValidationSummary({ validationResult, showDetails = false, className }: ValidationSummaryProps) {
  const summary = ValidationService.getValidationSummary(validationResult)

  if (!summary.hasErrors && !summary.hasWarnings) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>{summary.summary}</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Valid
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Summary Alert */}
      <Alert
        variant={summary.hasErrors ? "destructive" : "default"}
        className={summary.hasErrors ? "" : "border-amber-200 bg-amber-50"}
      >
        {summary.hasErrors ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
        <AlertDescription className={summary.hasErrors ? "" : "text-amber-800"}>
          <div className="flex items-center justify-between">
            <span>{summary.summary}</span>
            <div className="flex gap-2">
              {summary.hasErrors && (
                <Badge variant="destructive">
                  {summary.errorCount} Error{summary.errorCount > 1 ? "s" : ""}
                </Badge>
              )}
              {summary.hasWarnings && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  {summary.warningCount} Warning{summary.warningCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Detailed Messages */}
      {showDetails && (
        <div className="space-y-1">
          {validationResult.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium capitalize">{error.field}:</span> {error.message}
              </div>
            </div>
          ))}
          {validationResult.warnings.map((warning, index) => (
            <div
              key={`warning-${index}`}
              className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium capitalize">{warning.field}:</span> {warning.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
