import Link from "next/link";
import AcademySeal from "@/components/ui/academy-seal";
export const dynamic = "force-dynamic";
export default function Readiness() {
  const db = !!process.env.DATABASE_URL,
    auth = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-7">
      <AcademySeal size="md" variant="dark" />
      <p className="text-xs uppercase tracking-[.25em] text-[#8a6b30]">
        Office of the Registrar
      </p>
      <h1 className="font-playfair text-4xl">Academy Service Status</h1>
      <p className="leading-relaxed text-[#6b6459]">
        The academic catalog can be explored independently of student services.
        This page reports configured integrations; configuration alone does not
        establish successful end-to-end verification.
      </p>
      <dl className="border border-[#DDD5C5] rounded-2xl divide-y divide-[#DDD5C5]">
        {[
          ["Academic catalog", "Available · six schools and 48 courses"],
          ["Student records", db ? "Configured" : "Awaiting isolated database"],
          [
            "Sign-in and registration",
            auth ? "Configured" : "Awaiting isolated authentication",
          ],
          [
            "Scholar AI",
            process.env.ANTHROPIC_API_KEY
              ? "Configured · usage requires authorization"
              : "Awaiting authorized AI configuration",
          ],
          [
            "Tuition and payments",
            process.env.STRIPE_SECRET_KEY
              ? "Configured · test payment verification required"
              : "Not enabled · tuition and test checkout configuration required",
          ],
        ].map(([label, value]) => (
          <div key={label} className="p-5 flex flex-wrap justify-between gap-3">
            <dt className="font-semibold">{label}</dt>
            <dd className="text-sm text-[#6b6459]">{value}</dd>
          </div>
        ))}
      </dl>
      <Link
        href="/schools"
        className="inline-block bg-[#1C3327] text-[#F3ECDA] px-6 py-3 rounded-xl"
      >
        Explore the Schools
      </Link>
    </div>
  );
}
