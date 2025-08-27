"use client"

import { useEffect, useState } from "react"

// Hook for detecting user preferences
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
  })

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        prefersHighContrast: window.matchMedia("(prefers-contrast: high)").matches,
        prefersDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
      })
    }

    updatePreferences()

    const mediaQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-contrast: high)"),
      window.matchMedia("(prefers-color-scheme: dark)"),
    ]

    mediaQueries.forEach((mq) => mq.addEventListener("change", updatePreferences))

    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener("change", updatePreferences))
    }
  }, [])

  return preferences
}

// Hook for screen reader announcements
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    setAnnouncements((prev) => [...prev, message])

    // Create a temporary element for screen reader announcement
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", priority)
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
      setAnnouncements((prev) => prev.filter((msg) => msg !== message))
    }, 1000)
  }

  return { announce, announcements }
}

// Hook for managing skip links
export function useSkipLinks() {
  useEffect(() => {
    const skipLinks = document.querySelectorAll('[href^="#"]')

    skipLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector((link as HTMLAnchorElement).hash)
        if (target) {
          e.preventDefault()
          ;(target as HTMLElement).focus()
          target.scrollIntoView({ behavior: "smooth" })
        }
      })
    })
  }, [])
}
