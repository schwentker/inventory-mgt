"use client"

import { useEffect, useCallback } from "react"

interface KeyboardNavigationOptions {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
  onShiftTab?: () => void
  disabled?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (options.disabled) return

      switch (event.key) {
        case "Enter":
          if (options.onEnter) {
            event.preventDefault()
            options.onEnter()
          }
          break
        case "Escape":
          if (options.onEscape) {
            event.preventDefault()
            options.onEscape()
          }
          break
        case "ArrowUp":
          if (options.onArrowUp) {
            event.preventDefault()
            options.onArrowUp()
          }
          break
        case "ArrowDown":
          if (options.onArrowDown) {
            event.preventDefault()
            options.onArrowDown()
          }
          break
        case "ArrowLeft":
          if (options.onArrowLeft) {
            event.preventDefault()
            options.onArrowLeft()
          }
          break
        case "ArrowRight":
          if (options.onArrowRight) {
            event.preventDefault()
            options.onArrowRight()
          }
          break
        case "Tab":
          if (event.shiftKey && options.onShiftTab) {
            event.preventDefault()
            options.onShiftTab()
          } else if (!event.shiftKey && options.onTab) {
            event.preventDefault()
            options.onTab()
          }
          break
      }
    },
    [options],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

// Hook for managing focus within a container
export function useFocusManagement() {
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener("keydown", handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener("keydown", handleTabKey)
    }
  }, [])

  const restoreFocus = useCallback((previousActiveElement: Element | null) => {
    if (previousActiveElement && "focus" in previousActiveElement) {
      ;(previousActiveElement as HTMLElement).focus()
    }
  }, [])

  return { trapFocus, restoreFocus }
}
