"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8560A] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#C41A00] via-[#E8560A] to-[#D4960A] text-white hover:brightness-110 shadow-lg shadow-[#E8560A]/20",
        destructive:
          "bg-[#7a0a00] border border-[#C41A00]/50 text-red-300 hover:bg-[#9a1000]",
        outline:
          "border border-[#3d3220] bg-transparent text-[#f5efe8] hover:bg-[#1a1710] hover:border-[#5a4830]",
        ghost:
          "bg-transparent text-[#b8a898] hover:bg-[#1a1710] hover:text-[#f5efe8]",
        success:
          "bg-[#16a34a] text-white hover:bg-[#15803d]",
        fire:
          "border border-[#E8560A]/40 bg-[#E8560A]/10 text-[#F0B830] hover:bg-[#E8560A]/20 hover:border-[#E8560A]/60",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
