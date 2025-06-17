/**
 * @file shadcn-flavoured <Badge/> (aka “pill”) built with cva + Radix Slot.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*──────────────────────── Variants config (class-variance-authority) ──────*/
const badgeVariants = cva(
  [
    // Shared base styles:
    "inline-flex items-center justify-center gap-1 whitespace-nowrap",
    "rounded-md border px-2 py-0.5 text-xs font-medium w-fit shrink-0",
    "transition-[color,box-shadow] overflow-hidden",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Primary - uses --color-primary */
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        /** Secondary - uses --color-secondary */
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        /** Destructive / error */
        destructive:
          "border-transparent bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        /** Outline – transparent background */
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Generic badge / pill component.
 *
 * @param {{
 *   asChild?: boolean;
 *   variant?: "default" | "secondary" | "destructive" | "outline";
 * } & React.ComponentPropsWithoutRef<"span">} props
 */
export function Badge({ asChild = false, variant, className, ...props }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

/* Re-export the factory in case downstream code needs to compose variants. */
export { badgeVariants };
