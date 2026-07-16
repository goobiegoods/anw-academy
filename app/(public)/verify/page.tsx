"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AcademySeal from "@/components/ui/academy-seal";

export default function VerifyLandingPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  return (
    <div className="w-full bg-[#faf8f4] min-h-[70vh] py-20">
      <div className="max-w-xl mx-auto px-6 flex flex-col items-center text-center">
        <AcademySeal size="lg" variant="gold" />
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a] mt-6">
          Certificate Verification
        </h1>
        <p className="text-[14px] text-[#6b6459] mt-4 max-w-md leading-relaxed">
          Every ANW certification is publicly verifiable. Enter a certificate number
          (e.g. ANW-2026-00001-01) or a student number to confirm its authenticity.
        </p>

        <form
          className="w-full max-w-md mt-8 flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) router.push(`/verify/${encodeURIComponent(code.trim())}`);
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ANW-2026-XXXXX-XX"
            className="flex-1 bg-white border border-[#DDD5C5] rounded-xl px-4 py-3 text-sm font-mono text-[#1a1a1a] placeholder:text-[#a09080] focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]/30 transition-colors"
          />
          <button
            type="submit"
            className="bg-[#1C3327] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#2d5240] transition-colors"
          >
            Verify
          </button>
        </form>

        <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a9088] mt-12">
          Est. 2026
        </p>
      </div>
    </div>
  );
}
