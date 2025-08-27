import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Stone Slab Inventory Management",
  description: "Professional inventory management system for stone fabrication businesses",
  generator: "v0.app",
  keywords: "inventory management, stone fabrication, accessibility, WCAG compliant",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className="font-sans antialiased">
        <div id="announcements" aria-live="polite" aria-atomic="true" className="sr-only" />

        {children}

        <Toaster />
      </body>
    </html>
  )
}
