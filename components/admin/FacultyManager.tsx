"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { Plus, Pencil, EyeOff, Eye, Upload, X } from "lucide-react";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

const INPUT =
  "w-full bg-[#faf8f4] border border-[#e2ddd5] rounded-lg px-3.5 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a09080] focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]/30 transition-colors";

export type FacultyRecord = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  credentials: string[];
  specializations: string[];
  schools: string[];
  coursesTaught: string[];
  photoUrl: string | null;
  email: string | null;
  linkedinUrl: string | null;
  personalWebsite: string | null;
  isActive: boolean;
  isFounding: boolean;
};

type FormState = {
  name: string;
  slug: string;
  title: string;
  bio: string;
  credentials: string;
  specializations: string;
  schools: string[];
  coursesTaught: string;
  photoUrl: string;
  email: string;
  linkedinUrl: string;
  personalWebsite: string;
  isFounding: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  title: "",
  bio: "",
  credentials: "",
  specializations: "",
  schools: [],
  coursesTaught: "",
  photoUrl: "",
  email: "",
  linkedinUrl: "",
  personalWebsite: "",
  isFounding: false,
};

function toForm(f: FacultyRecord): FormState {
  return {
    name: f.name,
    slug: f.slug,
    title: f.title,
    bio: f.bio,
    credentials: f.credentials.join(", "),
    specializations: f.specializations.join(", "),
    schools: f.schools,
    coursesTaught: f.coursesTaught.join(", "),
    photoUrl: f.photoUrl ?? "",
    email: f.email ?? "",
    linkedinUrl: f.linkedinUrl ?? "",
    personalWebsite: f.personalWebsite ?? "",
    isFounding: f.isFounding,
  };
}

function splitList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function FacultyManager({
  faculty,
  schoolNames,
}: {
  faculty: FacultyRecord[];
  schoolNames: string[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
    setError(null);
  };

  const openEdit = (f: FacultyRecord) => {
    setForm(toForm(f));
    setEditing(f.id);
    setError(null);
  };

  const close = () => {
    setEditing(null);
    setError(null);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/faculty/photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setForm((f) => ({ ...f, photoUrl: json.photoUrl }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      title: form.title,
      bio: form.bio,
      credentials: splitList(form.credentials),
      specializations: splitList(form.specializations),
      schools: form.schools,
      coursesTaught: splitList(form.coursesTaught),
      photoUrl: form.photoUrl || null,
      email: form.email || null,
      linkedinUrl: form.linkedinUrl || null,
      personalWebsite: form.personalWebsite || null,
      isFounding: form.isFounding,
    };
    try {
      const res =
        editing === "new"
          ? await fetch("/api/admin/faculty", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/faculty/${editing}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      close();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (f: FacultyRecord) => {
    setBusy(true);
    try {
      if (f.isActive) {
        await fetch(`/api/admin/faculty/${f.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/admin/faculty/${f.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a]">Faculty</h1>
          <p className="text-[13px] text-[#6b6459] mt-1">
            {faculty.filter((f) => f.isActive).length} active ·{" "}
            {faculty.filter((f) => !f.isActive).length} inactive
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors hover:opacity-90"
          style={{ backgroundColor: FOREST }}
        >
          <Plus size={15} />
          Add Faculty
        </button>
      </div>

      {/* ── Form (add / edit) ────────────────────────────────────────── */}
      {editing && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#e2ddd5] rounded-2xl p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">
              {editing === "new" ? "Add New Faculty" : "Edit Faculty"}
            </h2>
            <button type="button" onClick={close} className="p-1.5 rounded-lg text-[#6b6459] hover:bg-[#f5f1ea]">
              <X size={16} />
            </button>
          </div>

          {/* Photo */}
          <div className="flex items-center gap-4">
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photoUrl}
                alt="Faculty photo"
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: `2px solid ${GOLD}` }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: FOREST, border: `2px solid ${GOLD}` }}
              >
                <span className="font-playfair font-bold text-lg" style={{ color: GOLD }}>
                  {form.name ? getInitials(form.name) : "—"}
                </span>
              </div>
            )}
            <label className="flex items-center gap-2 text-[12px] font-semibold text-[#4a7c59] border border-[#4a7c59]/40 px-4 py-2 rounded-lg cursor-pointer hover:bg-[#4a7c59]/5 transition-colors">
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
            {form.photoUrl && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photoUrl: "" }))}
                className="text-[12px] text-[#9b4444] hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT} placeholder="e.g. Senior Lecturer, Herbal Medicine" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={INPUT} placeholder="auto-generated from name" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Bio * (markdown supported)</label>
              <textarea required rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={`${INPUT} resize-y`} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Credentials (comma-separated)</label>
              <input value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} className={INPUT} placeholder="Clinical Herbalist, RH(AHG)" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Specializations (comma-separated)</label>
              <input value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} className={INPUT} placeholder="Materia Medica, Formulation" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1.5">Schools</label>
              <div className="flex flex-wrap gap-2">
                {schoolNames.map((s) => {
                  const selected = form.schools.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          schools: selected
                            ? f.schools.filter((x) => x !== s)
                            : [...f.schools, s],
                        }))
                      }
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors"
                      style={
                        selected
                          ? { backgroundColor: FOREST, color: "#F3ECDA", borderColor: FOREST }
                          : { color: "#6b6459", borderColor: "#DDD5C5" }
                      }
                    >
                      {s.replace("School of ", "")}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Courses taught (comma-separated course slugs)</label>
              <input value={form.coursesTaught} onChange={(e) => setForm({ ...form, coursesTaught: e.target.value })} className={INPUT} placeholder="herbal-foundations, tcm-fundamentals" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3a3028] mb-1">Personal Website</label>
              <input value={form.personalWebsite} onChange={(e) => setForm({ ...form, personalWebsite: e.target.value })} className={INPUT} />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-[#3a3028]">
              <input
                type="checkbox"
                checked={form.isFounding}
                onChange={(e) => setForm({ ...form, isFounding: e.target.checked })}
              />
              Founding faculty
            </label>
          </div>

          {error && <p className="text-[12px] text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={busy || uploading}
              className="text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: FOREST }}
            >
              {busy ? "Saving…" : editing === "new" ? "Add Faculty" : "Save Changes"}
            </button>
            <button type="button" onClick={close} className="text-sm text-[#6b6459] hover:text-[#1a1a1a]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── List ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e2ddd5] rounded-2xl overflow-hidden">
        {faculty.length === 0 ? (
          <p className="text-sm text-[#6b6459] text-center py-10">No faculty yet — add the first member.</p>
        ) : (
          faculty.map((f, i) => (
            <div
              key={f.id}
              className={`flex items-center gap-4 px-6 py-4 ${
                i < faculty.length - 1 ? "border-b border-[#f0ece4]" : ""
              } ${!f.isActive ? "opacity-55" : ""}`}
            >
              {f.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.photoUrl}
                  alt={f.name}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  style={{ border: `2px solid ${GOLD}` }}
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: FOREST, border: `2px solid ${GOLD}` }}
                >
                  <span className="font-playfair font-bold text-[13px]" style={{ color: GOLD }}>
                    {getInitials(f.name)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1a1a1a] flex items-center gap-2">
                  {f.name}
                  {f.isFounding && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(212,169,74,0.15)", color: "#8a6b30" }}
                    >
                      Founding
                    </span>
                  )}
                  {!f.isActive && (
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#f0ece4] text-[#8a7a6a]">
                      Inactive
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-[#6b6459] truncate">
                  {f.title} · {f.schools.map((s) => s.replace("School of ", "")).join(", ") || "No schools"}
                </p>
              </div>
              <button
                onClick={() => openEdit(f)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4a7c59] px-3 py-1.5 rounded-lg hover:bg-[#4a7c59]/8 transition-colors flex-shrink-0"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={() => toggleActive(f)}
                disabled={busy}
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                style={{ color: f.isActive ? "#9b4444" : "#4a7c59" }}
              >
                {f.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                {f.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
