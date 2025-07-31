import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[12px] border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-[oklch(0.58_0.15_142)] text-white hover:bg-[oklch(0.58_0.15_142)]/80",
        warning:
          "border-transparent bg-[oklch(0.75_0.15_85)] text-white hover:bg-[oklch(0.75_0.15_85)]/80",
        error:
          "border-transparent bg-[oklch(0.55_0.20_25)] text-white hover:bg-[oklch(0.55_0.20_25)]/80",
        info:
          "border-transparent bg-[oklch(0.50_0.20_250)] text-white hover:bg-[oklch(0.50_0.20_250)]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }