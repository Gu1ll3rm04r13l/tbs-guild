import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:  "bg-[#2a2318] text-[#b8a898] border border-[#3d3220]",
        pending:  "bg-amber-950/50 text-amber-400 border border-amber-800/50",
        accepted: "bg-green-950/50 text-green-400 border border-green-800/50",
        rejected: "bg-red-950/50 text-red-400 border border-red-800/50",
        mythic:   "bg-[#E8560A]/10 text-[#F0B830] border border-[#E8560A]/30",
        fire:     "bg-gradient-to-r from-[#C41A00]/20 to-[#D4960A]/20 text-[#F0B830] border border-[#E8560A]/30",
        officer:  "bg-purple-950/50 text-purple-400 border border-purple-800/50",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
