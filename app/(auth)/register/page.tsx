"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Create the ANW User record (with a StudentProfile) alongside the auth account
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, name: form.name }),
      });
    } catch {
      // User record creation is retried on first login via role lookup
    }

    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#4a7c59] flex items-center justify-center text-white font-bold font-playfair">
            ANW
          </div>
        </Link>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Create your account</h1>
        <p className="text-[#6b6459] mt-2">Begin your natural wellness journey</p>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[20px] shadow-card p-8">
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Full Name</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Email Address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              placeholder="At least 8 characters"
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a7c59] text-white font-semibold py-3 rounded-xl hover:bg-[#2d5240] transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6b6459]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#4a7c59] font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
