"use client"

import { useEffect, useState } from "react"
import { useAccessibilityPreferences } from "@/hooks/use-accessibility"

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  color?: "primary" | "success" | "warning" | "danger"
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  showLabel = false,
  color = "primary",
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const { prefersReducedMotion } = useAccessibilityPreferences()
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(percentage)
      return
    }

    const timer = setTimeout(() => {
      setDisplayValue(percentage)
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage, prefersReducedMotion])

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out`}
          style={{ width: `${displayValue}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>{Math.round(percentage)}%</span>
          <span>
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  )
}
