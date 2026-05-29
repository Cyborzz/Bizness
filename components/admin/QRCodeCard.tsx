"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Copy, Download, ExternalLink, Printer } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";

function slugFromUrl(url: string) {
  try {
    const path = new URL(url, "https://x").pathname.replace(/^\/+/, "");
    return path.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "qr-code";
  } catch {
    return "qr-code";
  }
}

export function QRCodeCard({ url, title = "QR code public" }: { url: string; title?: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const downloadName = useMemo(() => `qr-${slugFromUrl(url)}.png`, [url]);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 720,
      margin: 1,
      color: { dark: "#0a0f1f", light: "#ffffff" },
    }).then(setDataUrl);
  }, [url]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function print() {
    if (!dataUrl) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>QR ${slugFromUrl(url)}</title>
        <style>
          body { display:flex; align-items:center; justify-content:center; height:100vh; margin:0; font-family:system-ui,sans-serif; }
          .card { text-align:center; }
          img { width:320px; height:320px; }
          p { margin-top:16px; font-size:14px; color:#475569; }
        </style>
        </head>
        <body>
          <div class="card">
            <img src="${dataUrl}" alt="" />
            <p>${url}</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-ink">{title}</h2>
          <p className="mt-1 break-all text-xs font-mono text-muted">{url}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-center rounded-2xl bg-surface-muted p-4">
        {dataUrl ? (
          <Image
            src={dataUrl}
            alt={`QR code ${url}`}
            width={240}
            height={240}
            unoptimized
            className="rounded-lg bg-white p-2 shadow-sm"
          />
        ) : (
          <div className="h-60 w-60 animate-pulse rounded-lg bg-white" />
        )}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="secondary" onClick={copy}>
          <Copy aria-hidden className="h-4 w-4" />
          {copied ? "Copié !" : "Copier l'URL"}
        </Button>
        <a
          href={dataUrl || "#"}
          download={downloadName}
          aria-disabled={!dataUrl}
          onClick={(event) => {
            if (!dataUrl) event.preventDefault();
          }}
          className="focus-ring btn-press inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink ring-1 ring-border transition hover:bg-surface-muted aria-disabled:pointer-events-none aria-disabled:opacity-55"
        >
          <Download aria-hidden className="h-4 w-4" />
          {dataUrl ? "PNG haute déf." : "Génération…"}
        </a>
        <Button type="button" variant="secondary" onClick={print} disabled={!dataUrl}>
          <Printer aria-hidden className="h-4 w-4" />
          Imprimer
        </Button>
        <LinkButton
          href={url.replace(/^https?:\/\/[^/]+/, "") || "/"}
          variant="ghost"
          target="_blank"
        >
          <ExternalLink aria-hidden className="h-4 w-4" />
          Ouvrir
        </LinkButton>
      </div>
    </div>
  );
}
