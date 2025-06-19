"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className={cn("border-muted border-t-primary rounded-full animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground animate-pulse">{text}</span>}
    </div>
  )
}
