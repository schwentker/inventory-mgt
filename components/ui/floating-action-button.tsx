"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { animationClasses } from "@/lib/animations"

interface FloatingActionButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  className?: string
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label = "Add",
  position = "bottom-right",
  className = "",
}: FloatingActionButtonProps) {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }

  return (
    <Button
      onClick={onClick}
      size="lg"
      className={`
        fixed ${positionClasses[position]} z-50 
        rounded-full shadow-lg 
        ${animationClasses.hoverLift} ${animationClasses.buttonPress}
        ${className}
      `}
      aria-label={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  )
}
