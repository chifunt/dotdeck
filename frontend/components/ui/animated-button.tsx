"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface AnimatedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  animation?: "bounce" | "pulse" | "glow" | "scale";
}

export function AnimatedButton({
  children,
  loading = false,
  loadingText,
  animation = "scale",
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const animationClasses = {
    bounce: "hover:animate-bounce-subtle",
    pulse: "hover:animate-pulse",
    glow: "hover-glow",
    scale: "hover-scale transition-all duration-200",
  };

  return (
    <Button
      className={cn(
        "relative overflow-hidden",
        animationClasses[animation],
        loading && "cursor-not-allowed",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <LoadingSpinner size="sm" text={loadingText} />
        </div>
      )}

      {/* Make children sit horizontally */}
      <span
        className={cn("inline-flex items-center gap-2", loading && "opacity-0")}
      >
        {children}
      </span>
    </Button>
  );
}
