"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({
  className,
  style,
  iconColor,
}: {
  className?: string;
  style?: CSSProperties;
  iconColor?: string;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setError("");

    const supabase = createClient();
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Sign out failed. Please try again.");
      setSigningOut(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={signingOut}
      className={className}
      style={style}
    >
      <LogOut size={16} className="flex-shrink-0" style={{ color: iconColor }} />
      <span role={error ? "alert" : undefined}>
        {error || (signingOut ? "Signing Out…" : "Sign Out")}
      </span>
    </button>
  );
}
