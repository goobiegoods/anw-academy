"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Role-based redirect: ADMIN → /admin, PRACTITIONER → /practitioner, STUDENT → /dashboard
    let destination = "/dashboard";
    try {
      const res = await fetch("/api/auth/role");
      if (res.ok) {
        const { role } = await res.json();
        if (role === "ADMIN") destination = "/admin";
        else if (role === "PRACTITIONER") destination = "/practitioner";
      }
    } catch {
      // Fall back to student dashboard
    }
    router.push(destination);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#4a7c59] flex items-center justify-center text-white font-bold font-playfair">
            ANW
          </div>
        </Link>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Welcome back</h1>
        <p className="text-[#6b6459] mt-2">Sign in to The Academy of Natural Wellness</p>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[20px] shadow-card p-8">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Email address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a7c59] text-white font-semibold py-3 rounded-xl hover:bg-[#2d5240] transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6b6459]">
          Don&apos;t have an account?{" "}
          <Link href="/admissions" className="text-[#4a7c59] font-medium hover:underline">
            Apply to ANW
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#6b6459]">
        For demo: <span className="font-mono text-[#4a7c59]">student@anwacademy.com</span> / <span className="font-mono text-[#4a7c59]">password123</span>
      </p>
    </div>
  );
}
