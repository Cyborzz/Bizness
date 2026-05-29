import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FideliQR — Carte fidélité digitale pour commerces locaux",
    template: "%s | FideliQR",
  },
  description:
    "SaaS mobile-first de carte fidélité digitale par QR code pour snacks, restaurants, instituts et commerces locaux. Sans application, sans complexité.",
  applicationName: "FideliQR",
  keywords: [
    "carte fidélité",
    "QR code",
    "loyalty SaaS",
    "commerce local",
    "fidélisation client",
    "tampon digital",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "FideliQR",
    title: "FideliQR — Carte fidélité digitale pour commerces locaux",
    description:
      "Une carte fidélité digitale en QR code, sans application, prête en 48h pour vos commerces.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FideliQR — Loyalty OS local",
    description:
      "Une carte fidélité digitale en QR code, sans application, prête en 48h.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
