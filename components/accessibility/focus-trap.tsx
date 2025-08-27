"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useFocusManagement } from "@/hooks/use-keyboard-navigation"

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  restoreFocus?: boolean
}

export function FocusTrap({ children, active = true, restoreFocus = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<Element | null>(null)
  const { trapFocus, restoreFocus: restore } = useFocusManagement()

  useEffect(() => {
    if (!active || !containerRef.current) return

    previousActiveElementRef.current = document.activeElement
    const cleanup = trapFocus(containerRef.current)

    return () => {
      cleanup()
      if (restoreFocus) {
        restore(previousActiveElementRef.current)
      }
    }
  }, [active, trapFocus, restore, restoreFocus])

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  )
}
