"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  value?: string;
};
export default function PersistedForm({
  endpoint,
  method = "POST",
  fields,
  label,
  success = "Saved.",
  destination,
}: {
  endpoint: string;
  method?: string;
  fields: Field[];
  label: string;
  success?: string;
  destination?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setMessage("");
        const form = e.currentTarget;
        try {
          const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(
              result.error || "Could not save. Please try again.",
            );
          setMessage(success);
          form.reset();
          if (destination)
            router.push(
              destination === "$client"
                ? `/practitioner/clients/${result.id}`
                : destination,
            );
          router.refresh();
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Could not save.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      {fields.map((field) => (
        <label key={field.name} className="block text-sm font-medium">
          {field.label}
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              required={field.required}
              maxLength={field.maxLength || 8000}
              defaultValue={field.value}
              rows={4}
              className="mt-2 w-full border border-[#DDD5C5] rounded-xl p-3 bg-white"
            />
          ) : (
            <input
              name={field.name}
              type={field.type || "text"}
              required={field.required}
              maxLength={field.maxLength || 500}
              defaultValue={field.value}
              className="mt-2 w-full border border-[#DDD5C5] rounded-xl p-3 bg-white"
            />
          )}
        </label>
      ))}
      <button
        disabled={pending}
        className="bg-[#1C3327] text-[#F3ECDA] rounded-xl px-5 py-3 font-semibold disabled:opacity-50"
      >
        {pending ? "Saving…" : label}
      </button>
      <p role="status" className="text-sm">
        {message}
      </p>
    </form>
  );
}
