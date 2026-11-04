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
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setError(
        "Student sign-in is unavailable on this preview until an isolated Academy backend is connected.",
      );
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }

    // Create the Academy record only after Supabase has verified the identity.
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, name: form.name }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.error || "We could not create your Academy profile.",
        );
      }
    } catch {
      setError(
        "Your sign-in was created, but your Academy profile could not be completed. Please try signing in again or contact support.",
      );
      setLoading(false);
      return;
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
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">
          Create your account
        </h1>
        <p className="text-[#6b6459] mt-2">
          Begin your natural wellness journey
        </p>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[20px] shadow-card p-8">
        {confirmationSent ? (
          <div className="text-center" role="status">
            <p className="font-playfair text-xl font-bold text-[#1a1a1a]">
              Check your email
            </p>
            <p className="text-sm text-[#6b6459] mt-3 leading-relaxed">
              We sent a confirmation link to <strong>{form.email}</strong>. Your
              Academy record will be created after you confirm your address.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm font-semibold text-[#4a7c59] hover:underline"
            >
              Return to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label
                  className="block text-sm font-medium text-[#1a1a1a] mb-1.5"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  required
                  id="name"
                  autoComplete="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-[#1a1a1a] mb-1.5"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  required
                  id="email"
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-[#1a1a1a] mb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  required
                  id="password"
                  autoComplete="new-password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
              <Link
                href="/login"
                className="text-[#4a7c59] font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
