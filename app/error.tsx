"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <AlertTriangle className="h-10 w-10 text-amber-400" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#f5f5f5]">Something went wrong</h2>
        <p className="text-sm text-[#6b7280]">An unexpected error occurred. Please try again.</p>
      </div>
      <Button variant="outline" onClick={reset}>Try again</Button>
    </div>
  );
}
