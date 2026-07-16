"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Client-side QR code linking to the public verification page. */
export default function DiplomaQR({
  verifyPath,
  size = 76,
}: {
  verifyPath: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}${verifyPath}`;
    QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1,
      color: { dark: "#1C3327", light: "#00000000" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [verifyPath, size]);

  if (!dataUrl) return <div style={{ width: size, height: size }} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Scan to verify this diploma"
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
