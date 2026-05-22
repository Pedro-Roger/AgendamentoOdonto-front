import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";

export default async function NotFound() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
