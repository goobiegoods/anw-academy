export type TeachingVideo = { kind: "file" | "embed"; src: string };
/** Accept only supported HTTPS media; never inject arbitrary embed HTML. */
export function teachingVideo(value: string): TeachingVideo | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port)
    return null;
  const host = url.hostname.toLowerCase();
  if (
    [
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "www.youtube-nocookie.com",
    ].includes(host)
  ) {
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : url.pathname.startsWith("/embed/")
          ? url.pathname.split("/")[2]
          : url.searchParams.get("v");
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
    return {
      kind: "embed",
      src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    };
  }
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
    const id = url.pathname.match(/^(?:\/video)?\/(\d+)$/)?.[1];
    if (!id) return null;
    const hash = url.searchParams.get("h");
    if (hash && !/^[a-zA-Z0-9]+$/.test(hash)) return null;
    return {
      kind: "embed",
      src: `https://player.vimeo.com/video/${id}?dnt=1${hash ? `&h=${hash}` : ""}`,
    };
  }
  if (/\.(mp4|webm)$/i.test(url.pathname))
    return { kind: "file", src: url.href };
  return null;
}
