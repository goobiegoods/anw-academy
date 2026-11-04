"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { teachingVideo } from "@/lib/teaching-video";
export default function TeachingFilm({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const source = teachingVideo(url);
  if (!source) return null;
  return (
    <section
      aria-label="Filmed teaching"
      className="my-8 overflow-hidden rounded-2xl border border-[#D8C8B7] bg-[#F5EFE6]"
    >
      <div className="p-5 sm:p-6">
        <p className="text-[10px] tracking-[.22em] uppercase font-semibold text-[#9A6749]">
          In the teaching room
        </p>
        <h2 className="font-playfair text-2xl text-[#302A27] mt-2">{title}</h2>
        <p className="text-sm text-[#76695E] mt-2">
          Watch the teaching, then continue with the reading and practice below.
        </p>
      </div>
      {playing ? (
        <div className="aspect-video bg-[#292421]">
          {source.kind === "file" ? (
            <video
              controls
              playsInline
              preload="metadata"
              className="h-full w-full"
              src={source.src}
              aria-label={title}
            >
              Your browser does not support this video.
            </video>
          ) : (
            <iframe
              className="h-full w-full"
              src={source.src}
              title={`Filmed teaching: ${title}`}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="flex min-h-40 sm:min-h-56 w-full items-center justify-center gap-3 bg-[#E9DED0] text-[#44372F] hover:bg-[#E0D1BF] transition-colors"
        >
          <span className="rounded-full border border-[#A98C72] p-4">
            <Play size={22} />
          </span>
          <span className="text-sm font-semibold">Play the teaching</span>
        </button>
      )}
      <p className="px-5 py-3 text-xs text-[#76695E]">
        Watching supports your study. Lesson completion is recorded through the
        assessment.
      </p>
    </section>
  );
}
