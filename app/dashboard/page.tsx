"use client";

import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { NewAppointmentButton } from "@/components/NewAppointmentButton";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { CalendarX } from "lucide-react";
import { useEffect, useState } from "react";
import { adminApi, dashboardApi } from "@/src/lib/frontend-api";
import type { DashboardSummary } from "@/src/lib/frontend-api";
import type { AppointmentListItemDto } from "@/src/types/dto";

export default function Dashboard() {
  const [appointments, setAppointments] = useState<AppointmentListItemDto[] | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [windowDays, setWindowDays] = useState<7 | 30>(30);

  useEffect(() => {
    adminApi.listAppointments().then(setAppointments).catch(() => setAppointments([]));
  }, []);

  useEffect(() => {
    setSummary(null);
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (windowDays - 1));
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    dashboardApi
      .summary(iso(from), iso(to))
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [windowDays]);

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
        actionSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-cream-100 border border-sage-100 rounded-full p-1">
              {([7, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setWindowDays(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    windowDays === d
                      ? "bg-sage-400 text-white"
                      : "text-ink-500 hover:text-ink-700"
                  }`}
                >
                  {d} dias
                </button>
              ))}
            </div>
            <NewAppointmentButton />
          </div>
        }
      />

      <DashboardCharts summary={summary} />

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
                  {a.reason && (
                    <div className="text-xs text-ink-400 mt-0.5 truncate italic">
                      {a.reason}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
