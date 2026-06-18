import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: "Seedling",
    2: "Apprentice",
    3: "Practitioner",
    4: "Advanced Practitioner",
    5: "Community Leader",
    6: "Senior Practitioner",
  };
  return titles[level] || "Master Practitioner";
}

export function getWUForLevel(level: number): { min: number; max: number } {
  const levels: Record<number, { min: number; max: number }> = {
    1: { min: 0, max: 150 },
    2: { min: 150, max: 500 },
    3: { min: 500, max: 750 },
    4: { min: 750, max: 1000 },
    5: { min: 1000, max: 1250 },
    6: { min: 1250, max: 1750 },
  };
  return levels[level] || { min: 1750, max: 9999 };
}

export function getSchoolColor(slug: string): string {
  const colors: Record<string, string> = {
    "herbal-medicine": "#4a7c59",
    "traditional-chinese-medicine": "#c0392b",
    "homeopathic-studies": "#5b4fcf",
    "functional-wellness": "#d4882a",
    "practice-building": "#2c6e8a",
    "wellness-entrepreneurship": "#7a5c3a",
  };
  return colors[slug] || "#4a7c59";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
