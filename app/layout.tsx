import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { themeInitScript } from "@/src/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: "%s · Sorriso Odonto",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "agendamento odontológico",
    "sistema dentista",
    "prontuário digital",
    "clínica odontológica",
    "anamnese online",
    "gestão dentária",
    "software dentista",
  ],
  authors: [{ name: "Sorriso Odonto" }],
  creator: "Sorriso Odonto",
  publisher: "Sorriso Odonto",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/sorriso.png", type: "image/png" },
    ],
    shortcut: [{ url: "/sorriso.png" }],
    apple: [{ url: "/sorriso.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/sorriso.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/sorriso.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "health",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-cream-50 text-ink-700 dark:bg-ink-800 dark:text-cream-100">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
