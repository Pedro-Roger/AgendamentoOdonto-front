import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
