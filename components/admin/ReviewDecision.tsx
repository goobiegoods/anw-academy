"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ReviewDecision({
  id,
  kind,
}: {
  id: string;
  kind: "assignment" | "case" | "capstone";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="space-y-3 mt-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
          const res = await fetch("/api/admin/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, id, kind }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error);
          setMessage(`Review recorded · ${result.wuAwarded} WU awarded`);
          router.refresh();
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Could not save review.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="block text-sm">
        Faculty feedback
        <textarea
          name="feedback"
          required
          minLength={10}
          maxLength={6000}
          rows={3}
          className="block w-full mt-2 border rounded-xl p-3"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Review decision"
          name="decision"
          className="border rounded-lg p-3"
        >
          <option value="approved">Approve</option>
          <option value="rejected">Return for revision</option>
        </select>
        {kind === "case" && (
          <label className="text-sm">
            WU (10–25)
            <input
              aria-label="WU to award"
              name="wu"
              type="number"
              min={10}
              max={25}
              defaultValue={10}
              className="w-24 block border p-3 rounded-lg"
            />
          </label>
        )}
        <button
          disabled={pending}
          className="bg-[#1C3327] text-white px-5 py-3 rounded-xl"
        >
          Record Decision
        </button>
      </div>
      <p role="status" className="text-sm">
        {message}
      </p>
    </form>
  );
}
