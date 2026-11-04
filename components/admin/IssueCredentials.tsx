"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function IssueCredentials({ userId }: { userId: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <div className="mt-5 space-y-3">
      <button
        disabled={pending}
        className="border border-[#1C3327] rounded-xl px-5 py-3 text-sm"
        onClick={async () => {
          setPending(true);
          try {
            const r = await fetch("/api/admin/credentials", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            setMessage(
              d.awarded.length
                ? `Issued: ${d.awarded.join(", ")}`
                : d.blocked.length
                  ? d.blocked.join("; ")
                  : "No additional credential requirements have been met.",
            );
            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Could not issue credentials.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        Review Eligibility & Issue Earned Credentials
      </button>
      <p role="status" className="text-sm">
        {message}
      </p>
    </div>
  );
}
