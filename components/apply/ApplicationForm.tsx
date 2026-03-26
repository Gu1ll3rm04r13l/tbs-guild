"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const WOW_CLASSES: Record<string, string[]> = {
  "Death Knight": ["Blood", "Frost", "Unholy"],
  "Demon Hunter": ["Havoc", "Vengeance"],
  Druid: ["Balance", "Feral", "Guardian", "Restoration"],
  Evoker: ["Augmentation", "Devastation", "Preservation"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Mage: ["Arcane", "Fire", "Frost"],
  Monk: ["Brewmaster", "Mistweaver", "Windwalker"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Rogue: ["Assassination", "Outlaw", "Subtlety"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Warrior: ["Arms", "Fury", "Protection"],
};

type FormState = "idle" | "loading" | "success" | "error";

export function ApplicationForm() {
  const [charName, setCharName] = useState("");
  const [charClass, setCharClass] = useState("");
  const [spec, setSpec] = useState("");
  const [rioLink, setRioLink] = useState("");
  const [logsLink, setLogsLink] = useState("");
  const [uiUrl, setUiUrl] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const availableSpecs = charClass ? WOW_CLASSES[charClass] ?? [] : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          char_name: charName,
          class: charClass,
          spec,
          rio_link: rioLink || undefined,
          logs_link: logsLink || undefined,
          ui_screenshot_url: uiUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setFormState("error");
        return;
      }

      setFormState("success");
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle className="h-12 w-12 text-green-400" />
        <h3 className="text-lg font-semibold text-[#f5f5f5]">Application submitted!</h3>
        <p className="text-sm text-[#6b7280] max-w-sm">
          We&apos;ll review it and reach out on Discord. Make sure you&apos;re in the TBS Discord server.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
      {/* Character name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#a3a3a3]">Character Name *</label>
        <Input
          required
          value={charName}
          onChange={(e) => setCharName(e.target.value)}
          placeholder="Arthas"
          minLength={2}
          maxLength={32}
        />
      </div>

      {/* Class */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#a3a3a3]">Class *</label>
        <Select
          required
          value={charClass}
          onValueChange={(v) => { setCharClass(v); setSpec(""); }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(WOW_CLASSES).map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spec */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#a3a3a3]">Specialization *</label>
        <Select
          required
          value={spec}
          onValueChange={setSpec}
          disabled={!charClass}
        >
          <SelectTrigger>
            <SelectValue placeholder={charClass ? "Select spec" : "Select class first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{charClass || "—"}</SelectLabel>
              {availableSpecs.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Raider.io */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#a3a3a3]">
          Raider.io Profile <span className="text-[#6b7280]">(optional)</span>
        </label>
        <Input
          type="url"
          value={rioLink}
          onChange={(e) => setRioLink(e.target.value)}
          placeholder="https://raider.io/characters/eu/realm/Name"
        />
      </div>

      {/* WarcraftLogs */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#a3a3a3]">
          WarcraftLogs <span className="text-[#6b7280]">(optional)</span>
        </label>
        <Input
          type="url"
          value={logsLink}
          onChange={(e) => setLogsLink(e.target.value)}
          placeholder="https://www.warcraftlogs.com/character/eu/realm/Name"
        />
      </div>

      {/* UI Screenshot */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#a3a3a3]">
          UI Screenshot URL <span className="text-[#6b7280]">(optional)</span>
        </label>
        <Input
          type="url"
          value={uiUrl}
          onChange={(e) => setUiUrl(e.target.value)}
          placeholder="https://imgur.com/..."
        />
      </div>

      {/* Error */}
      {formState === "error" && (
        <div className="flex items-center gap-2 rounded border border-red-800/50 bg-red-950/30 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={formState === "loading"}
      >
        {formState === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}
