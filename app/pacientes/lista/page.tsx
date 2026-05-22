"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { Search, ChevronRight, Users, AlertCircle } from "lucide-react";
import { adminApi } from "@/src/lib/frontend-api";
import type { PatientDto } from "@/src/types/dto";

function maskCpf(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PacientesPage() {
  const [patients, setPatients] = useState<PatientDto[] | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      adminApi
        .listPatients(q.trim() || undefined)
        .then(setPatients)
        .catch((e: any) => setError(e?.message ?? "Erro ao carregar pacientes"));
    }, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [q]);

  const total = patients?.length ?? 0;

  return (
    <AppShell>
      <Topbar title="Pacientes" subtitle={`${total} cadastrados`} />

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-6 relative max-w-md">
        <label htmlFor="patient-search" className="sr-only">
          Buscar paciente
        </label>
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          id="patient-search"
          aria-label="Buscar paciente"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nome ou CPF…"
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-sage-100 rounded-full text-sm focus:outline-none focus:border-sage-300"
        />
      </div>

      {patients && patients.length === 0 ? (
        <div className="bg-white border border-sage-100 rounded-3xl p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-sm text-ink-500">Nenhum paciente encontrado.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {(patients ?? []).map((p) => (
            <li key={p.id}>
              <Link
                href={`/pacientes/perfil?id=${encodeURIComponent(p.id)}`}
                className="flex items-center gap-4 p-4 bg-white border border-sage-100 rounded-2xl hover:shadow-soft transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-peach-100 text-peach-500 flex items-center justify-center font-display">
                  {initials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-700 truncate">{p.name}</div>
                  <div className="text-xs text-ink-400 truncate">
                    {maskCpf(p.cpf)} · {p.phone}
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
