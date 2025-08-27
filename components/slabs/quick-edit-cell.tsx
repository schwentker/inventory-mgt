"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Check, X, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Slab } from "@/types/inventory"

interface QuickEditCellProps {
  value: string | number
  field: keyof Slab
  slab: Slab
  onUpdate: (id: string, updates: Partial<Slab>) => void
  type?: "text" | "number" | "select"
  options?: string[]
  className?: string
}

export function QuickEditCell({
  value,
  field,
  slab,
  onUpdate,
  type = "text",
  options = [],
  className,
}: QuickEditCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value || ""))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue !== String(value)) {
      const updates: Partial<Slab> = {}
      if (type === "number") {
        updates[field] = Number(editValue) as any
      } else {
        updates[field] = editValue as any
      }
      onUpdate(slab.id, updates)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(String(value || ""))
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        {type === "select" ? (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-7 text-xs min-w-0"
            type={type === "number" ? "number" : "text"}
          />
        )}
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleSave}>
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleCancel}>
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 min-w-0",
        className,
      )}
      onClick={() => setIsEditing(true)}
    >
      <span className="truncate flex-1 text-sm">{value || "-"}</span>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
    </div>
  )
}
