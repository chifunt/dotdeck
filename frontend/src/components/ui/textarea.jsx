/**
 * @file Multi-line textarea with the same design tokens as <Input/>.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @param {React.ComponentPropsWithoutRef<"textarea">} props
 */
export function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        [
          "flex w-full min-h-16 rounded-md border bg-transparent px-3 py-2",
          "text-base shadow-xs transition-[color,box-shadow] md:text-sm",
          "border-input placeholder:text-muted-foreground dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          "disabled:cursor-not-allowed disabled:opacity-50 field-sizing-content",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}
