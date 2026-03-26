import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded border border-[#3d3220] bg-[#080706] px-3 py-2 text-sm text-[#f5efe8] placeholder:text-[#6b5e50]",
        "focus:outline-none focus:ring-2 focus:ring-[#E8560A]/40 focus:border-[#E8560A]/50",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
