"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/src/lib/frontend-api";
import { Building2, CalendarClock, Sparkles, Trash2, Plus, Check } from "lucide-react";

type Block = { weekDay: number; startTime: string; endTime: string };

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const inputCls =
  "w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white transition-all dark:bg-ink-900 dark:border-ink-700 dark:text-cream-50";

type Props = {
  clinicName?: string;
  onComplete?: () => void;
};

export function OnboardingWizard({ clinicName, onComplete }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // step 2 — schedule blocks
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [weekDay, setWeekDay] = useState(1);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");

  // step 3 — service
  const [serviceName, setServiceName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addBlock() {
    if (!startTime || !endTime) return;
    setBlocks((prev) => [...prev, { weekDay, startTime, endTime }]);
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  async function concluir() {
    setError(null);
    setSubmitting(true);
    try {
      await adminApi.replaceSchedules(blocks);
      await adminApi.createService({
        name: serviceName,
        durationMinutes: Number(durationMinutes),
      });
      if (onComplete) onComplete();
      else router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Não foi possível concluir o onboarding.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { icon: Building2, label: "Clínica" },
    { icon: CalendarClock, label: "Horários" },
    { icon: Sparkles, label: "Primeiro serviço" },
  ];

  return (
    <div className="w-full max-w-xl bg-white border border-sage-100 rounded-3xl p-8 dark:bg-ink-800 dark:border-ink-700">
      {/* progress indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-sage-600">
          Passo {step}/3
        </span>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  active
                    ? "bg-sage-400 text-white"
                    : done
                    ? "bg-sage-100 text-sage-600"
                    : "bg-cream-100 text-ink-400 dark:bg-ink-700"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check size={15} /> : <Icon size={15} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1 — Clínica */}
      {step === 1 && (
        <div>
          <h1 className="font-display text-2xl text-ink-700 dark:text-cream-50 mt-4">
            Bem-vindo{clinicName ? `, ${clinicName}` : ""}
          </h1>
          <p className="text-sm text-ink-500 dark:text-cream-200 mt-2">
            Vamos configurar sua clínica em três passos rápidos: defina seus
            horários de atendimento e cadastre o primeiro serviço. Você pode
            ajustar tudo depois nas configurações.
          </p>
        </div>
      )}

      {/* Step 2 — Horários */}
      {step === 2 && (
        <div>
          <h1 className="font-display text-2xl text-ink-700 dark:text-cream-50 mt-4">
            Horários de atendimento
          </h1>
          <p className="text-sm text-ink-500 dark:text-cream-200 mt-2 mb-5">
            Adicione os blocos de horário em que a clínica atende.
          </p>

          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
            <div>
              <label
                htmlFor="ob-day"
                className="block text-xs text-ink-500 dark:text-cream-200 mb-1"
              >
                Dia
              </label>
              <select
                id="ob-day"
                className={inputCls}
                value={weekDay}
                onChange={(e) => setWeekDay(Number(e.target.value))}
              >
                {WEEK_DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="ob-start"
                className="block text-xs text-ink-500 dark:text-cream-200 mb-1"
              >
                Início
              </label>
              <input
                id="ob-start"
                type="time"
                className={inputCls}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="ob-end"
                className="block text-xs text-ink-500 dark:text-cream-200 mb-1"
              >
                Fim
              </label>
              <input
                id="ob-end"
                type="time"
                className={inputCls}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={addBlock}
              className="h-[42px] px-3.5 bg-sage-400 text-white rounded-2xl hover:bg-sage-500 transition-colors flex items-center gap-1 text-sm"
            >
              <Plus size={15} /> Adicionar
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {blocks.length === 0 && (
              <li className="text-xs text-ink-400">
                Nenhum horário adicionado ainda.
              </li>
            )}
            {blocks.map((b, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-sage-100 dark:bg-ink-900 dark:border-ink-700"
              >
                <span className="text-sm text-ink-700 dark:text-cream-50">
                  <span className="font-medium">{WEEK_DAYS[b.weekDay]}</span>{" "}
                  {b.startTime} – {b.endTime}
                </span>
                <button
                  type="button"
                  onClick={() => removeBlock(i)}
                  aria-label="Remover"
                  className="text-rose-500 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 3 — Primeiro serviço */}
      {step === 3 && (
        <div>
          <h1 className="font-display text-2xl text-ink-700 dark:text-cream-50 mt-4">
            Primeiro serviço
          </h1>
          <p className="text-sm text-ink-500 dark:text-cream-200 mt-2 mb-5">
            Cadastre o serviço que será oferecido aos pacientes.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="ob-service-name"
                className="block text-xs text-ink-500 dark:text-cream-200 mb-1"
              >
                Nome do serviço
              </label>
              <input
                id="ob-service-name"
                className={inputCls}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Ex.: Limpeza dental"
              />
            </div>
            <div>
              <label
                htmlFor="ob-service-duration"
                className="block text-xs text-ink-500 dark:text-cream-200 mb-1"
              >
                Duração (minutos)
              </label>
              <input
                id="ob-service-duration"
                type="number"
                min={1}
                className={inputCls}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || submitting}
          className="px-5 py-2.5 rounded-full text-sm text-ink-500 hover:text-ink-700 disabled:opacity-40 dark:text-cream-200"
        >
          Voltar
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            className="px-6 py-2.5 bg-sage-400 text-white rounded-full hover:bg-sage-500 transition-colors text-sm"
          >
            Próximo
          </button>
        ) : (
          <button
            type="button"
            onClick={concluir}
            disabled={submitting}
            className="px-6 py-2.5 bg-sage-400 text-white rounded-full hover:bg-sage-500 transition-colors text-sm disabled:opacity-60"
          >
            {submitting ? "Concluindo…" : "Concluir"}
          </button>
        )}
      </div>
    </div>
  );
}
