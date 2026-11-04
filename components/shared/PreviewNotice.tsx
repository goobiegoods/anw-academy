import Link from "next/link";
export default function PreviewNotice() {
  if (process.env.VERCEL_ENV !== "preview") return null;
  return (
    <aside className="bg-[#F3ECDA] text-[#1C3327] border-b border-[#D4A94A]/40 px-5 py-3 text-center text-xs leading-relaxed">
      Academy development preview ·{" "}
      {process.env.ANW_PREVIEW_BACKEND_ENABLED === "true"
        ? "Isolated backend enabled"
        : "Read-only catalog; student services await an isolated backend"}
      .{" "}
      <Link href="/about/readiness" className="underline underline-offset-2">
        Service status
      </Link>
    </aside>
  );
}
