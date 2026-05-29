"use client";

import { useEffect } from "react";

export default function GlobalLevelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0a0f1f",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ color: "#f5b84b", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", fontSize: 12 }}>
            Erreur critique
          </p>
          <h1 style={{ marginTop: 8, fontSize: 36, fontWeight: 900, letterSpacing: -0.5 }}>
            L&apos;application n&apos;a pas pu démarrer.
          </h1>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.7)" }}>
            Rafraîchissez la page. Si le problème persiste, contactez le support.
          </p>
          {error.digest ? (
            <p style={{ marginTop: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              id : {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              borderRadius: 10,
              border: 0,
              background: "#2454ff",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
