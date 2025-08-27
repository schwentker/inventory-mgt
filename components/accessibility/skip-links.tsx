"use client"

import Link from "next/link"

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <Link
        href="#main-content"
        className="absolute top-0 left-0 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </Link>
      <Link
        href="#navigation"
        className="absolute top-0 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to navigation
      </Link>
    </div>
  )
}
