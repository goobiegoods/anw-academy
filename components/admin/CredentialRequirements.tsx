"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function CredentialRequirements({
  id,
  required,
  courses,
}: {
  id: string;
  required: string[];
  courses: { slug: string; title: string }[];
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <details className="mt-4 border-t border-[#DDD5C5] pt-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Required coursework · {required.length} courses
      </summary>
      <form
        className="space-y-4 mt-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const requiredCourses = new FormData(e.currentTarget).getAll(
            "course",
          );
          try {
            const r = await fetch(`/api/admin/certifications/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ requiredCourses }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            setMessage(
              "Required coursework saved. Eligibility will use these requirements.",
            );
            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Could not save requirements.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {courses.map((c) => (
            <label key={c.slug} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                name="course"
                value={c.slug}
                defaultChecked={required.includes(c.slug)}
              />
              {c.title}
            </label>
          ))}
        </div>
        <button
          disabled={pending}
          className="bg-[#1C3327] rounded-xl text-white px-4 py-3 text-sm"
        >
          Save Required Coursework
        </button>
        <p role="status" className="text-sm">
          {message}
        </p>
      </form>
    </details>
  );
}
