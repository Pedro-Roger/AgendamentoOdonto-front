import { noindexMetadata } from "@/src/lib/noindex-metadata";

export const metadata = { ...noindexMetadata, title: "Configurações" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
