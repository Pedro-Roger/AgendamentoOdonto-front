"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { adminApi } from "@/src/lib/frontend-api";
import type { AppointmentListItemDto } from "@/src/types/dto";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import Link from "next/link";

const HOUR_START = 7;
const HOUR_END = 20;
const SLOT_HEIGHT = 56; // px por hora

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez",
];

const SERVICE_COLORS = [
  "bg-sage-200 border-sage-400 text-sage-800",
  "bg-peach-200 border-peach-400 text-peach-800",
  "bg-rose-100 border-rose-300 text-rose-700",
  "bg-cream-200 border-cream-400 text-ink-700",
  "bg-blue-100 border-blue-300 text-blue-800",
];

function colorForService(serviceId: string) {
  let hash = 0;
  for (let i = 0; i < serviceId.length; i++) hash += serviceId.charCodeAt(i);
  return SERVICE_COLORS[hash % SERVICE_COLORS.length];
}

function isoWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function timeToOffset(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h - HOUR_START) * 60 + m) * (SLOT_HEIGHT / 60);
}

function durationToHeight(minutes: number): number {
  return minutes * (SLOT_HEIGHT / 60);
}

function formatWeekLabel(start: Date, end: Date): string {
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
}

function isToday(date: Date): boolean {
  const t = new Date();
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  );
}

export default function AgendaPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => isoWeekStart(new Date()));
  const [appointments, setAppointments] = useState<AppointmentListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppointmentListItemDto | null>(null);

  const weekEnd = addDays(weekStart, 6);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .listAppointmentsWeek(toIso(weekStart), toIso(weekEnd))
      .then(setAppointments)
      .catch((e: any) => setError(e?.message ?? "Erro ao carregar agenda"))
      .finally(() => setLoading(false));
  }, [weekStart]);

  function byDay(day: Date): AppointmentListItemDto[] {
    const iso = toIso(day);
    return appointments.filter((a) => a.date === iso);
  }

  const totalHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;

  return (
    <AppShell>
      <Topbar title="Agenda" subtitle="Visão semanal" />

      {/* Navegação da semana */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="w-9 h-9 rounded-xl bg-white border border-sage-100 flex items-center justify-center hover:bg-cream-100 text-ink-500"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-ink-700 min-w-[180px] text-center">
            {formatWeekLabel(weekStart, weekEnd)}
          </span>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="w-9 h-9 rounded-xl bg-white border border-sage-100 flex items-center justify-center hover:bg-cream-100 text-ink-500"
            aria-label="Próxima semana"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setWeekStart(isoWeekStart(new Date()))}
            className="px-3 py-1.5 text-xs rounded-full border border-sage-200 text-ink-500 hover:bg-cream-100"
          >
            Hoje
          </button>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 shadow-soft"
        >
          <Plus size={14} />
          Novo agendamento
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-400 text-sm">
          Carregando agenda...
        </div>
      ) : (
        <div className="bg-white border border-sage-100 rounded-3xl overflow-hidden">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-sage-100">
            <div className="border-r border-sage-100" />
            {days.map((d, i) => (
              <div
                key={i}
                className={`p-2 text-center border-r border-sage-100 last:border-r-0 ${
                  isToday(d) ? "bg-sage-100" : ""
                }`}
              >
                <div className="text-[10px] text-ink-400 uppercase">{DAYS[d.getDay()]}</div>
                <div
                  className={`text-sm font-medium mt-0.5 ${
                    isToday(d)
                      ? "w-7 h-7 rounded-full bg-sage-400 text-white flex items-center justify-center mx-auto"
                      : "text-ink-700"
                  }`}
                >
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horas */}
          <div className="overflow-y-auto max-h-[600px]">
            <div className="grid grid-cols-[48px_repeat(7,1fr)]" style={{ height: totalHeight }}>
              {/* Coluna de horas */}
              <div className="relative border-r border-sage-100">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 text-[10px] text-ink-400 text-right pr-2"
                    style={{ top: (h - HOUR_START) * SLOT_HEIGHT - 6 }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Colunas dos dias */}
              {days.map((d, di) => {
                const dayAppts = byDay(d);
                return (
                  <div
                    key={di}
                    className={`relative border-r border-sage-100 last:border-r-0 ${
                      isToday(d) ? "bg-sage-50" : ""
                    }`}
                    style={{ height: totalHeight }}
                  >
                    {/* Linhas de hora */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-sage-100/60"
                        style={{ top: (h - HOUR_START) * SLOT_HEIGHT }}
                      />
                    ))}

                    {/* Cards de consulta */}
                    {dayAppts.map((appt) => {
                      const top = timeToOffset(appt.time);
                      const height = Math.max(
                        durationToHeight(appt.service?.durationMinutes ?? 30),
                        28,
                      );
                      const color = colorForService(appt.service?.id ?? "default");
                      return (
                        <button
                          key={appt.id}
                          onClick={() => setSelected(appt)}
                          title={`${appt.patient?.name} — ${appt.service?.name}`}
                          className={`absolute left-0.5 right-0.5 rounded-lg border px-1.5 py-0.5 text-left overflow-hidden hover:brightness-95 transition-all ${color}`}
                          style={{ top, height }}
                        >
                          <div className="text-[10px] font-medium truncate leading-tight">
                            {appt.time} {appt.patient?.name}
                          </div>
                          {height > 40 && (
                            <div className="text-[9px] truncate opacity-75">
                              {appt.service?.name}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhe */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-ink-700/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-600 flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
              <div>
                <div className="font-display text-lg text-ink-700">{selected.patient?.name}</div>
                <div className="text-xs text-ink-400">{selected.service?.name}</div>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">Data</dt>
                <dd className="text-ink-700 font-medium">{selected.date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Horário</dt>
                <dd className="text-ink-700 font-medium">{selected.time}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Duração</dt>
                <dd className="text-ink-700 font-medium">
                  {selected.service?.durationMinutes}min
                </dd>
              </div>
              {selected.reason && (
                <div className="pt-2 border-t border-sage-100">
                  <dt className="text-ink-400 text-xs mb-1">Motivo</dt>
                  <dd className="text-ink-700 text-xs">{selected.reason}</dd>
                </div>
              )}
            </dl>
            <div className="flex gap-2 mt-5">
              <Link
                href={`/prontuario?patientId=${selected.patient?.id}`}
                className="flex-1 py-2.5 text-center text-sm bg-sage-400 text-white rounded-full hover:bg-sage-500"
              >
                Abrir prontuário
              </Link>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 text-sm border border-sage-200 rounded-full text-ink-500 hover:bg-cream-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
