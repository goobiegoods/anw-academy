"use client";

import { useState } from "react";
import { Printer, Share2 } from "lucide-react";

/**
 * Print + share buttons for official documents (transcript, diploma).
 * Hidden when printing.
 */
export default function DocumentActions({
  printLabel,
  shareUrl,
  shareLabel = "Share Verification Link",
}: {
  printLabel: string;
  shareUrl: string;
  shareLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const absolute = shareUrl.startsWith("http")
        ? shareUrl
        : `${window.location.origin}${shareUrl}`;
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard unavailable — fall back to a prompt
      window.prompt("Copy this verification link:", shareUrl);
    }
  };

  return (
    <div className="print:hidden flex items-center gap-3 flex-wrap">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-[#1C3327] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2d5240] transition-colors"
      >
        <Printer size={15} />
        {printLabel}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-xl border transition-colors"
        style={{
          color: "#8a6b30",
          borderColor: "rgba(212,169,74,0.5)",
          backgroundColor: copied ? "rgba(212,169,74,0.15)" : "transparent",
        }}
      >
        <Share2 size={15} />
        {copied ? "Verification link copied ✓" : shareLabel}
      </button>
    </div>
  );
}
