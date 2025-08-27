"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OptimisticButtonProps extends React.ComponentProps<typeof Button> {
  onAsyncClick?: () => Promise<void>
  loadingText?: string
  successText?: string
  errorText?: string
}

export function OptimisticButton({
  onAsyncClick,
  loadingText = "Loading...",
  successText,
  errorText,
  children,
  className,
  disabled,
  ...props
}: OptimisticButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleClick = async () => {
    if (!onAsyncClick) return

    setState("loading")
    try {
      await onAsyncClick()
      setState("success")
      setTimeout(() => setState("idle"), 2000)
    } catch (error) {
      setState("error")
      setTimeout(() => setState("idle"), 3000)
    }
  }

  const getButtonText = () => {
    switch (state) {
      case "loading":
        return loadingText
      case "success":
        return successText || children
      case "error":
        return errorText || children
      default:
        return children
    }
  }

  const getButtonVariant = () => {
    switch (state) {
      case "success":
        return "default"
      case "error":
        return "destructive"
      default:
        return props.variant
    }
  }

  return (
    <Button
      {...props}
      variant={getButtonVariant()}
      className={cn(className)}
      disabled={disabled || state === "loading"}
      onClick={onAsyncClick ? handleClick : props.onClick}
    >
      {state === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {getButtonText()}
    </Button>
  )
}
