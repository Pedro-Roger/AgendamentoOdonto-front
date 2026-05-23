"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok) {
        throw new Error(data?.message ?? `Erro ${res.status}`);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-sage-200 relative overflow-hidden grain">
        <div className="absolute top-20 left-16 w-72 h-72 rounded-full bg-peach-100 opacity-60 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-rose-100 opacity-50 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-cream-100 opacity-70 blur-xl animate-float"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Image
            src="/sorriso.png"
            alt="Sorriso Clínica Odontológica"
            width={640}
            height={240}
            priority
            className="h-auto w-auto max-h-64 object-contain"
          />

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream-50/70 backdrop-blur rounded-full text-xs text-ink-600 mb-6 border border-sage-300/50">
              <Sparkles size={12} className="text-peach-400" />
              Novo · Form builder de anamnese
            </div>
            <h2 className="font-display text-5xl text-ink-700 leading-[1.05] mb-5">
              Cuidar de sorrisos
              <br />
              <em className="text-sage-600">com calma</em>
              <span className="text-peach-400">.</span>
            </h2>
            <p className="text-ink-500 text-base leading-relaxed">
              Agendamentos, prontuários versionados e o histórico completo
              do paciente em um único lugar.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-ink-500">
            <span>© 2026 Sorriso</span>
            <span>·</span>
            <Link href="#" className="hover:text-ink-700">Termos</Link>
            <Link href="#" className="hover:text-ink-700">Privacidade</Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fadeUp">
          <div className="lg:hidden mb-10">
            <Image
              src="/sorriso.png"
              alt="Sorriso"
              width={480}
              height={180}
              priority
              className="h-auto w-auto max-h-48 object-contain"
            />
          </div>

          <div className="mb-8">
            <div className="text-sm text-peach-400 font-medium mb-2 tracking-wide">
              BEM-VINDA DE VOLTA
            </div>
            <h1 className="font-display text-3xl text-ink-700 mb-2">
              Acesse sua clínica
            </h1>
            <p className="text-ink-400 text-sm">
              Entre com suas credenciais para continuar.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 mb-4 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="text-xs text-ink-500 font-medium mb-1.5 block"
              >
                E-mail profissional
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-cream-100 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs text-ink-500 font-medium">
                  Senha
                </label>
                <Link href="#" className="text-xs text-sage-500 hover:text-sage-600">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-16 py-3 bg-cream-100 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-400 hover:text-ink-600"
                >
                  {showPwd ? "ocultar" : "ver"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full mt-6 py-3.5 bg-sage-400 hover:bg-sage-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-medium text-sm transition-all shadow-soft group"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Entrar na clínica
              {!loading && (
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-sage-100 text-center">
            <span className="text-sm text-ink-400">Ainda não tem uma conta? </span>
            <Link href="#" className="text-sm text-sage-600 font-medium hover:underline">
              Conhecer o Sorriso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
