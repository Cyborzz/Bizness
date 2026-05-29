import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FideliQR — Carte fidélité",
    short_name: "FideliQR",
    description:
      "Votre carte fidélité digitale, sans application à télécharger.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1f",
    theme_color: "#0a0f1f",
    orientation: "portrait",
    categories: ["lifestyle", "shopping", "business"],
    lang: "fr-FR",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
