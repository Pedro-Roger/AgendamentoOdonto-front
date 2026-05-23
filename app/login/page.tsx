import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar na sua clínica",
  description:
    "Acesse o Sorriso para gerenciar agendamentos, prontuários, anamnese digital e assinatura eletrônica da sua clínica odontológica em um só lugar.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Entrar · Sorriso Odonto",
    description:
      "Acesse o Sorriso para gerenciar agendamentos, prontuários e pacientes da sua clínica odontológica.",
    url: "/login",
    type: "website",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
