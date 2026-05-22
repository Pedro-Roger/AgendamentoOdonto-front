import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sorriso · Sistema Odontológico",
  description: "Gestão clínica acolhedora para dentistas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-cream-50 text-ink-700">{children}</body>
    </html>
  );
}
