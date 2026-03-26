import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded border border-[#3d3220] bg-[#080706] px-3 py-1 text-sm text-[#f5efe8] placeholder:text-[#6b5e50]",
        "focus:outline-none focus:ring-2 focus:ring-[#E8560A]/40 focus:border-[#E8560A]/50",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
