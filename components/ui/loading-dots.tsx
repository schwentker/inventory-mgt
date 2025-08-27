"use client"

import { useAccessibilityPreferences } from "@/hooks/use-accessibility"

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingDots({ size = "md", className = "" }: LoadingDotsProps) {
  const { prefersReducedMotion } = useAccessibilityPreferences()

  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  }

  const dotClass = `${sizeClasses[size]} bg-current rounded-full ${prefersReducedMotion ? "" : "animate-pulse"}`

  return (
    <div className={`flex items-center space-x-1 ${className}`} aria-label="Loading">
      <div className={dotClass} style={{ animationDelay: "0ms" }} />
      <div className={dotClass} style={{ animationDelay: "150ms" }} />
      <div className={dotClass} style={{ animationDelay: "300ms" }} />
    </div>
  )
}
