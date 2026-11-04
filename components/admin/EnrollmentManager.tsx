"use client";
import IssueCredentials from "@/components/admin/IssueCredentials";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function EnrollmentManager({
  userId,
  courses,
}: {
  userId: string;
  courses: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <section className="border border-[#DDD5C5] bg-[#FAF7F0] p-6 rounded-2xl">
      <h2 className="font-playfair text-xl mb-4">
        Registrar · Course Enrollment
      </h2>
      <form
        className="flex flex-wrap gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          try {
            const form = new FormData(e.currentTarget);
            const res = await fetch("/api/admin/enrollments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, courseId: form.get("courseId") }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage("Enrollment saved.");
            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Could not enroll.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <select
          name="courseId"
          required
          aria-label="Course to enroll"
          className="min-w-0 flex-1 rounded-lg border p-3"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button
          disabled={pending}
          className="bg-[#1C3327] text-white rounded-lg px-4 py-3"
        >
          Grant Course Access
        </button>
      </form>
      <p role="status" className="text-sm mt-3">
        {message}
      </p>
      <IssueCredentials userId={userId} />
    </section>
  );
}
