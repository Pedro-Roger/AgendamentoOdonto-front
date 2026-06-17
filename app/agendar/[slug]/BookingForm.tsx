"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, CalendarX, CheckCircle2 } from "lucide-react";
import { publicApi } from "@/src/lib/frontend-api";
import type { ScheduleDto, ServiceDto } from "@/src/types/dto";

const inputCls =
  "w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm placeholder:text-ink-400 focus:outline-none focus:border-sage-300 focus:bg-white transition-all";

const todayIso = () => new Date().toISOString().slice(0, 10);

function maskCpf(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function BookingForm({ slug }: { slug: string }) {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [slots, setSlots] = useState<ScheduleDto[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    publicApi
      .services(slug)
      .then((list) => setServices(list.filter((s) => s.isActive)))
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      setTime("");
      return;
    }
    setLoadingSlots(true);
    setError(null);
    publicApi
      .availability(slug, serviceId, date)
      .then((list) => {
        setSlots(list);
        setTime("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [slug, serviceId, date]);

  const noSlots = !loadingSlots && serviceId && date && slots.length === 0;

  const canSubmit = useMemo(
    () =>
      name.trim() &&
      cpf.replace(/\D/g, "").length === 11 &&
      email.trim() &&
      phone.replace(/\D/g, "").length >= 10 &&
      serviceId &&
      date &&
      time &&
      !submitting,
    [name, cpf, email, phone, serviceId, date, time, submitting]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await publicApi.createAppointment(slug, {
        name: name.trim(),
        cpf: cpf.replace(/\D/g, ""),
        email: email.trim(),
        phone: phone.replace(/\D/g, ""),
        serviceId,
        date,
        time,
        reason: reason.trim(),
        anamnesisAnswers: [],
      });
      setDone(true);
    } catch (e: any) {
      setError(e.message ?? "Erro ao agendar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <div className="bg-white border border-sage-100 rounded-3xl p-8 text-center">
        <CalendarX size={40} className="text-rose-400 mx-auto mb-3" />
        <h1 className="font-display text-xl text-ink-700">Clínica não encontrada</h1>
        <p className="text-sm text-ink-400 mt-2">Verifique o link de agendamento.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-white border border-sage-100 rounded-3xl p-8 text-center">
        <CheckCircle2 size={48} className="text-sage-500 mx-auto mb-4" />
        <h1 className="font-display text-2xl text-ink-700">Agendamento confirmado!</h1>
        <p className="text-sm text-ink-500 mt-2">
          Você receberá uma confirmação. Até breve!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sage-100 rounded-3xl p-6 sm:p-8">
      <h1 className="font-display text-2xl text-ink-700">Agende sua consulta</h1>
      <p className="text-xs text-ink-400 mt-1 mb-6">
        Preencha seus dados e escolha um horário disponível.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome completo">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
              placeholder="Maria Silva"
            />
          </Field>
          <Field label="CPF">
            <input
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              required
              className={inputCls}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              placeholder="maria@email.com"
            />
          </Field>
          <Field label="Celular">
            <input
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              required
              className={inputCls}
              placeholder="(11) 91234-5678"
              inputMode="tel"
            />
          </Field>
          <Field label="Serviço">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Selecione…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes}min)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={date}
              min={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputCls}
            />
          </Field>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-500 mb-2">
            Horários disponíveis
          </label>
          {!serviceId ? (
            <p className="text-xs text-ink-400 px-3 py-3 bg-cream-100 rounded-2xl">
              Selecione um serviço para ver horários.
            </p>
          ) : loadingSlots ? (
            <div className="flex items-center gap-2 text-xs text-ink-400 px-3 py-3">
              <Loader2 size={14} className="animate-spin" /> Buscando horários…
            </div>
          ) : noSlots ? (
            <div className="flex items-center gap-2 text-xs text-peach-500 px-3 py-3 bg-peach-100 rounded-2xl">
              <CalendarX size={14} />
              Sem horários disponíveis nesta data. Escolha outro dia.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => {
                const value = s.startTime;
                const selected = time === value;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setTime(value)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      selected
                        ? "bg-sage-400 border-sage-400 text-white"
                        : "bg-white border-sage-200 text-ink-600 hover:bg-cream-100"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Field label="Motivo da consulta (opcional)">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            className={inputCls}
            placeholder="Descreva brevemente o motivo da consulta…"
          />
        </Field>

        {error && (
          <div className="text-xs text-rose-500 bg-rose-100 rounded-2xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full px-5 py-3 rounded-full text-sm font-medium bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft inline-flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Agendar
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
