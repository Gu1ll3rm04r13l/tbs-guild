import type { Metadata } from "next";
import Image from "next/image";
import { ScrollText, Flame } from "lucide-react";
import { ApplicationForm } from "@/components/apply/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to join The Burning Seagull — Mythic raiding guild recruitment.",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="relative h-20 w-20">
              <Image
                src="/logo.png"
                alt="TBS Logo"
                fill
                className="object-contain drop-shadow-[0_0_16px_rgba(232,86,10,0.4)]"
                sizes="80px"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className="h-3.5 w-3.5 text-[#E8560A]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">Recruitment</span>
            </div>
            <h1 className="text-2xl font-black text-[#f5efe8]">Apply to TBS</h1>
            <p className="text-sm text-[#6b5e50] max-w-sm mx-auto mt-2">
              We raid semi-hardcore Mythic. We expect prepared players, not perfect ones.
              Fill in your details and we&apos;ll be in touch via Discord.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#E8560A]/30 to-transparent" />

        {/* Requirements */}
        <div className="rounded-lg border border-[#2a2318] bg-[#111009] px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <ScrollText className="h-3.5 w-3.5 text-[#E8560A]" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#6b5e50]">We look for</p>
          </div>
          <ul className="space-y-1.5 text-sm text-[#b8a898]">
            {[
              "Consistent raid attendance (80%+)",
              "Knowledge of your class at a competitive level",
              "Active presence on Discord",
              "Attitude over ego",
            ].map((req) => (
              <li key={req} className="flex items-center gap-2.5">
                <span className="text-[#E8560A] font-bold">→</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <ApplicationForm />
      </div>
    </div>
  );
}
