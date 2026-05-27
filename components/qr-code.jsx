"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/*
  Renders a redemption code as a scannable QR image. We generate the PNG data URL
  on the client with the qrcode package so no extra network request is needed.
  The encoded value is the order's redemption_code, which shop staff scan at pickup.
*/
export function QrCode({ value, size = 200 }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!value) return;
    let active = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#173404", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className="animate-pulse rounded-lg bg-muted"
        style={{ width: size, height: size }}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={size} alt={`QR code ${value}`} className="rounded-lg" />;
}
