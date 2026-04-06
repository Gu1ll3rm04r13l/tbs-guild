"use client";

import { LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function RecruitsHeader() {
  const { lang } = useLanguage();
  const TR = t[lang].recruits;
  return (
    <div className="space-y-1">
      <p className="text-xs font-mono uppercase tracking-widest text-[#c9a84c]">{TR.officersOnly}</p>
      <h1 className="text-2xl font-bold text-[#f5f5f5] flex items-center gap-2.5">
        <LayoutDashboard className="h-6 w-6 text-[#6b7280]" />
        {TR.title}
      </h1>
    </div>
  );
}
