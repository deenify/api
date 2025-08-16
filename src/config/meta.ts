import type { Metadata } from "next";

const siteTitle = "Islam Companion";
const siteUrl = "https://islamapp.com";
const description = `Your daily Islamic lifestyle app — Quran, Hadith, Adhan, Qibla, and more. 
Quran, Prayer Times, Qibla Direction, and more — all in one Islamic app.`;
const ogImage = `${siteUrl}/og.png`;

export const defaultMeta: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description,
  keywords: ["Quran", "Hadith", "Adhan", "Islamic App", "Hijri", "Muslim"],
  themeColor: "#0f172a",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: siteTitle,
    description,
    url: siteUrl,
    siteName: siteTitle,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Islam Companion OG Image",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description,
    creator: "@IslamApp",
    site: "@IslamApp",
    images: [ogImage],
  },
  applicationName: siteTitle,
  appleWebApp: {
    title: siteTitle,
    statusBarStyle: "black-translucent",
  },
  manifest: `${siteUrl}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
