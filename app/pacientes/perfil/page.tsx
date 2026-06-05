"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import {
  Mail,
  Phone,
  CreditCard,
  CalendarDays,
  FileSignature,
  ClipboardList,
  AlertCircle,
  Clock,
  FileText,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { adminApi } from "@/src/lib/frontend-api";

type AttachmentDto = { id: string; fileUrl: string; category?: string };
type AnamnesisEntry = { key: string; label: string; value: string };

const CATEGORY_LABELS: Record<string, string> = {
  MEDICAL_ATTACHMENT: "Anexo",
  PHYSICAL_SIGNATURE: "Assinatura fisica",
  ELECTRONIC_SIGNATURE: "Assinatura eletronica",
};

function isImage(url: string) {
  return /\.(png|jpe?g|webp)$/i.test(url);
}

type ProfileDto = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
};

type TimelineEvent = {
  id: string;
  type: "APPOINTMENT" | "MEDICAL_RECORD" | "SIGNATURE" | string;
  title: string;
  date: string;
  status?: string;
};

function iconFor(type: string) {
  if (type === "APPOINTMENT") return CalendarDays;
  if (type === "MEDICAL_RECORD") return ClipboardList;
  if (type === "SIGNATURE") return FileSignature;
  return Clock;
}

function maskCpf(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<AppShell><Topbar title="Carregando…" subtitle="Perfil do paciente" /></AppShell>}>
      <PerfilPageInner />
    </Suspense>
  );
}

function PerfilPageInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[] | null>(null);
  const [anamnesis, setAnamnesis] = useState<AnamnesisEntry[] | null>(null);
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminApi
      .patientProfile(id)
      .then((p: any) => setProfile(p))
      .catch((e: any) => setError(e?.message ?? "Erro ao carregar perfil"));
    adminApi
      .patientTimeline(id)
      .then((t: any) => setTimeline(t as TimelineEvent[]))
      .catch((e: any) => setError(e?.message ?? "Erro ao carregar histórico"));
    adminApi
      .getMedicalRecordByPatient(id)
      .then((rec: any) => {
        if (!rec) return;
        const anam = rec?.content?.anamnesis;
        if (Array.isArray(anam) && anam.length > 0) setAnamnesis(anam);
        if (rec.id) {
          adminApi
            .listMedicalAttachments(rec.id)
            .then((list: any) => {
              if (Array.isArray(list)) setAttachments(list);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [id]);

  return (
    <AppShell>
      <Topbar
        title={profile?.name ?? "Carregando…"}
        subtitle="Perfil do paciente"
      />

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="bg-white border border-sage-100 rounded-3xl p-6">
            <h2 className="font-display text-lg text-ink-700 mb-4">Informações</h2>
            {profile ? (
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-ink-600">
                  <CreditCard size={14} className="text-ink-400" />
                  {maskCpf(profile.cpf)}
                </li>
                <li className="flex items-center gap-3 text-ink-600">
                  <Mail size={14} className="text-ink-400" />
                  {profile.email}
                </li>
                <li className="flex items-center gap-3 text-ink-600">
                  <Phone size={14} className="text-ink-400" />
                  {profile.phone}
                </li>
              </ul>
            ) : (
              <p className="text-sm text-ink-400">Carregando…</p>
            )}
          </div>

          {anamnesis && anamnesis.length > 0 && (
            <div className="bg-white border border-sage-100 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={16} className="text-sage-600" />
                <h2 className="font-display text-lg text-ink-700">Anamnese</h2>
              </div>
              <dl className="space-y-3">
                {anamnesis.map((a) => (
                  <div key={a.key}>
                    <dt className="text-xs font-medium text-ink-500">{a.label}</dt>
                    <dd className="text-sm text-ink-700 mt-0.5">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {attachments.length > 0 && (
            <div className="bg-white border border-sage-100 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Paperclip size={16} className="text-sage-600" />
                <h2 className="font-display text-lg text-ink-700">Documentos</h2>
              </div>
              <ul className="space-y-2">
                {attachments.map((a) => {
                  const fileName = a.fileUrl.split("/").pop() ?? "";
                  const categoryLabel = CATEGORY_LABELS[a.category ?? ""] ?? "Anexo";
                  return (
                    <li key={a.id}>
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-100 transition-colors group"
                      >
                        {isImage(a.fileUrl) ? (
                          <img
                            src={a.fileUrl}
                            alt={fileName}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-sage-100 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-sage-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-ink-600 truncate group-hover:underline flex items-center gap-1">
                            {fileName}
                            <ExternalLink size={10} className="shrink-0 opacity-0 group-hover:opacity-100" />
                          </div>
                          <div className="text-xs text-ink-400">{categoryLabel}</div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 bg-white border border-sage-100 rounded-3xl p-6">
          <h2 className="font-display text-lg text-ink-700 mb-4">Histórico</h2>
          {timeline && timeline.length === 0 ? (
            <p className="text-sm text-ink-400">Nenhum evento registrado.</p>
          ) : (
            <ul className="space-y-3">
              {(timeline ?? []).map((ev) => {
                const Icon = iconFor(ev.type);
                return (
                  <li
                    key={ev.id}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-600 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-700">{ev.title}</div>
                      <div className="text-xs text-ink-400">
                        {ev.date}
                        {ev.status ? ` · ${ev.status}` : ""}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
