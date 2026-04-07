import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WOW_CLASS_COLORS: Record<string, string> = {
  "death-knight": "#C41E3A",
  "demon-hunter": "#A330C9",
  druid: "#FF7C0A",
  evoker: "#33937F",
  hunter: "#AAD372",
  mage: "#3FC7EB",
  monk: "#00FF98",
  paladin: "#F48CBA",
  priest: "#FFFFFF",
  rogue: "#FFF468",
  shaman: "#0070DD",
  warlock: "#8788EE",
  warrior: "#C69B3A",
};


export function getClassColor(className: string): string {
  const key = className.toLowerCase().replace(/\s+/g, "-");
  return WOW_CLASS_COLORS[key] ?? "#b8a898";
}
