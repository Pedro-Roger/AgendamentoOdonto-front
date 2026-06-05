"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { ConfigTabs } from "@/components/ConfigTabs";
import { Plus, X, AlertCircle, Loader2, CalendarClock } from "lucide-react";
import { adminApi } from "@/src/lib/frontend-api";
import type { ScheduleDto } from "@/src/types/dto";

type Slot = { startTime: string; endTime: string };
type DayState = { weekDay: number; name: string; active: boolean; slots: Slot[] };

const dayNames = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function emptyDays(): DayState[] {
  return dayNames.map((name, weekDay) => ({
    weekDay,
    name,
    active: false,
    slots: [],
  }));
}

function groupSchedules(list: ScheduleDto[]): DayState[] {
  const days = emptyDays();
  list.forEach((s) => {
    const d = days[s.weekDay];
    if (!d) return;
    d.active = true;
    d.slots.push({ startTime: s.startTime, endTime: s.endTime });
  });
  days.forEach((d) => d.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)));
  return days;
}

function flatten(days: DayState[]) {
  const out: Array<{ weekDay: number; startTime: string; endTime: string }> = [];
  days.forEach((d) => {
    if (!d.active) return;
    d.slots.forEach((s) => {
      if (s.startTime && s.endTime) {
        out.push({ weekDay: d.weekDay, startTime: s.startTime, endTime: s.endTime });
      }
    });
  });
  return out;
}

function detectOverlap(days: DayState[]): string | null {
  for (const d of days) {
    if (!d.active) continue;
    const sorted = [...d.slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      if (cur.startTime >= cur.endTime) {
        return `${d.name}: intervalo inválido (${cur.startTime}–${cur.endTime}).`;
      }
      if (i > 0 && cur.startTime < sorted[i - 1].endTime) {
        return `${d.name}: intervalos se sobrepõem.`;
      }
    }
  }
  return null;
}

export default function HorariosPage() {
  const [days, setDays] = useState<DayState[]>(emptyDays());
  const [loaded, setLoaded] = useState(false);
  const [hasAny, setHasAny] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .listSchedules()
      .then((list) => {
        setHasAny(list.length > 0);
        setDays(groupSchedules(list));
      })
      .catch((e: any) => setError(e?.message ?? "Erro ao carregar horários"))
      .finally(() => setLoaded(true));
  }, []);

  function toggleDay(weekDay: number) {
    setDays((prev) =>
      prev.map((d) =>
        d.weekDay === weekDay
          ? {
              ...d,
              active: !d.active,
              slots: !d.active && d.slots.length === 0
                ? [{ startTime: "08:00", endTime: "12:00" }]
                : d.slots,
            }
          : d
      )
    );
  }

  function addSlot(weekDay: number) {
    setDays((prev) =>
      prev.map((d) =>
        d.weekDay === weekDay
          ? { ...d, slots: [...d.slots, { startTime: "14:00", endTime: "18:00" }] }
          : d
      )
    );
  }

  function removeSlot(weekDay: number, idx: number) {
    setDays((prev) =>
      prev.map((d) =>
        d.weekDay === weekDay
          ? { ...d, slots: d.slots.filter((_, i) => i !== idx) }
          : d
      )
    );
  }

  function updateSlot(weekDay: number, idx: number, field: "startTime" | "endTime", value: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.weekDay === weekDay
          ? {
              ...d,
              slots: d.slots.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
            }
          : d
      )
    );
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);
    const overlap = detectOverlap(days);
    if (overlap) {
      setError(overlap);
      return;
    }
    setSaving(true);
    try {
      await adminApi.replaceSchedules(flatten(days));
      setHasAny(flatten(days).length > 0);
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar horários");
    } finally {
      setSaving(false);
    }
  }

  const showEmpty = loaded && !hasAny && days.every((d) => !d.active);

  return (
    <AppShell>
      <Topbar
        title="Configurações"
        subtitle="Personalize sua clínica do jeito que você atende"
        actionSlot={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 disabled:opacity-60 transition-colors shadow-soft"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Salvar alterações
          </button>
        }
      />
      <ConfigTabs />

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 px-3.5 py-3 rounded-2xl bg-sage-100 border border-sage-200 text-sage-600 text-sm">
          Horários salvos com sucesso.
        </div>
      )}

      <div className="bg-white border border-sage-100 rounded-3xl p-6">
        <div className="mb-6">
          <h2 className="font-display text-xl text-ink-700">Expediente da clínica</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Defina dias e janelas de atendimento. Pacientes só conseguem agendar nesses horários.
          </p>
        </div>

        {showEmpty && (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mb-4">
              <CalendarClock size={24} />
            </div>
            <p className="text-sm text-ink-500 max-w-sm mx-auto">
              Nenhum horário cadastrado. Ative os dias da semana abaixo e clique em{" "}
              <span className="font-medium text-ink-700">Salvar alterações</span>.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {days.map((d) => (
            <div
              key={d.weekDay}
              data-testid={`day-row-${d.weekDay}`}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-2xl border transition-all ${
                d.active
                  ? "bg-cream-100 border-sage-100"
                  : "bg-cream-50 border-transparent opacity-60"
              }`}
            >
              <label className="flex items-center gap-3 w-full sm:w-32 shrink-0 cursor-pointer">
                <button
                  type="button"
                  onClick={() => toggleDay(d.weekDay)}
                  aria-label={`${d.active ? "Desativar" : "Ativar"} ${d.name}`}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    d.active ? "bg-sage-400" : "bg-sage-100"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                      d.active ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-ink-700">{d.name}</span>
              </label>

              <div className="flex-1 flex items-center gap-2 flex-wrap">
                {d.active ? (
                  <>
                    {d.slots.map((slot, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-2 bg-white border border-sage-100 rounded-xl px-3 py-1.5"
                      >
                        <input
                          aria-label={`Início do intervalo ${j + 1} - ${d.name}`}
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(d.weekDay, j, "startTime", e.target.value)}
                          className="text-sm bg-transparent border-none focus:outline-none text-ink-700 w-20"
                        />
                        <span className="text-ink-400 text-xs">→</span>
                        <input
                          aria-label={`Fim do intervalo ${j + 1} - ${d.name}`}
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(d.weekDay, j, "endTime", e.target.value)}
                          className="text-sm bg-transparent border-none focus:outline-none text-ink-700 w-20"
                        />
                        <button
                          type="button"
                          onClick={() => removeSlot(d.weekDay, j)}
                          aria-label={`Remover intervalo ${j + 1} - ${d.name}`}
                          className="ml-1 text-ink-400 hover:text-rose-400"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSlot(d.weekDay)}
                      aria-label={`+ intervalo - ${d.name}`}
                      className="flex items-center gap-1 text-xs text-sage-600 hover:bg-sage-100 px-2.5 py-1.5 rounded-xl"
                    >
                      <Plus size={12} /> intervalo
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-ink-400">Sem expediente</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
