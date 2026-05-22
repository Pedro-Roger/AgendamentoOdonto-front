"use client";

import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { NewAppointmentButton } from "@/components/NewAppointmentButton";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  TrendingUp,
  CalendarX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { adminApi } from "@/src/lib/frontend-api";
import type {
  AppointmentListItemDto,
  PatientDto,
  ServiceDto,
} from "@/src/types/dto";

const toneMap: Record<string, string> = {
  sage: "bg-sage-100 text-sage-600",
  peach: "bg-peach-100 text-peach-500",
  rose: "bg-rose-100 text-rose-400",
};

export default function Dashboard() {
  const [patients, setPatients] = useState<PatientDto[] | null>(null);
  const [services, setServices] = useState<ServiceDto[] | null>(null);
  const [appointments, setAppointments] = useState<AppointmentListItemDto[] | null>(null);

  useEffect(() => {
    adminApi.listPatients().then(setPatients).catch(() => setPatients([]));
    adminApi.listServices().then(setServices).catch(() => setServices([]));
    adminApi.listAppointments().then(setAppointments).catch(() => setAppointments([]));
  }, []);

  const stats = [
    {
      label: "Atendimentos hoje",
      value: appointments ? String(appointments.length) : "…",
      sub: appointments && appointments.length === 0 ? "Nenhum hoje" : "Agendados",
      icon: CalendarDays,
      tone: "sage" as const,
    },
    {
      label: "Pacientes ativos",
      value: patients ? String(patients.length) : "…",
      sub: patients && patients.length === 0 ? "Nenhum paciente ainda" : "Total cadastrados",
      icon: Users,
      tone: "peach" as const,
    },
    {
      label: "Serviços ativos",
      value: services ? String(services.filter((s) => s.isActive).length) : "…",
      sub: "Configurados na clínica",
      icon: ClipboardCheck,
      tone: "rose" as const,
    },
    {
      label: "Taxa de retorno",
      value: "—",
      sub: "Sem dados suficientes",
      icon: TrendingUp,
      tone: "sage" as const,
    },
  ];

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <AppShell>
      <Topbar
        title="Painel"
        subtitle={today}
        actionSlot={<NewAppointmentButton />}
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white border border-sage-100 rounded-3xl p-5 hover:shadow-soft transition-shadow animate-fadeUp"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${toneMap[s.tone]}`}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>
              <div className="font-display text-3xl text-ink-700 leading-none mb-1">
                {s.value}
              </div>
              <div className="text-sm text-ink-500 mt-2">{s.label}</div>
              <div className="text-xs text-ink-400 mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-sage-100 rounded-3xl p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl text-ink-700">Agenda de hoje</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            {appointments
              ? `${appointments.length} consulta${appointments.length === 1 ? "" : "s"}`
              : "Carregando…"}
          </p>
        </div>

        {appointments && appointments.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mb-4">
              <CalendarX size={24} />
            </div>
            <p className="text-sm text-ink-500 max-w-md mx-auto">
              Sem consultas marcadas para hoje. Use{" "}
              <span className="font-medium text-ink-700">Novo agendamento</span>{" "}
              para começar.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {(appointments ?? []).map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-cream-100 transition-colors"
              >
                <div className="text-right w-16">
                  <div className="font-display text-lg text-ink-700 leading-none">
                    {a.time}
                  </div>
                  <div className="text-[10px] text-ink-400 mt-1">
                    {a.service.durationMinutes}min
                  </div>
                </div>
                <div className="w-px h-10 bg-sage-100" />
                <div className="w-9 h-9 rounded-full bg-peach-100 flex items-center justify-center font-display text-ink-700 text-sm">
                  {a.patient.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-700 truncate">
                    {a.patient.name}
                  </div>
                  <div className="text-xs text-ink-400 truncate">
                    {a.service.name}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
