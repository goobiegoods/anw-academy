"use client";
import { useState } from "react";
export default function TuitionCheckout({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        try {
          const courseId = new FormData(e.currentTarget).get("courseId");
          const res = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          const url = new URL(data.url);
          if (
            url.protocol !== "https:" ||
            url.hostname !== "checkout.stripe.com"
          )
            throw new Error("Invalid checkout destination.");
          window.location.assign(url.href);
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Checkout unavailable.",
          );
          setPending(false);
        }
      }}
    >
      <label className="block text-sm">
        Course
        <select
          name="courseId"
          className="block w-full border rounded-xl p-3 mt-2"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm">
        Review the exact tuition and terms on the secure checkout page before
        paying.
      </p>
      <button
        disabled={pending}
        className="bg-[#1C3327] text-white px-5 py-3 rounded-xl"
      >
        Review Tuition at Checkout
      </button>
      <p role="status" className="text-sm">
        {message}
      </p>
    </form>
  );
}
