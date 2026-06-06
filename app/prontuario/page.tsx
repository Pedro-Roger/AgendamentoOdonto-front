"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import {
  Save,
  Copy,
  Paperclip,
  AlertCircle,
  Loader2,
  FileSignature,
  ClipboardList,
  FileText,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { adminApi } from "@/src/lib/frontend-api";
import { Odontograma, type OdontogramaState } from "@/components/Odontograma";
import type { FormFieldDto } from "@/src/types/dto";

type Vitals = {
  paSistolica: string;
  paDiastolica: string;
  temperatura: string;
};

type Draft = {
  assessment: string;
  procedures: string;
  treatmentPlan: string;
  vitals: Vitals;
};


type Attachment = { id: string; fileUrl: string; category?: string };

export default function ProntuarioPage() {
  return (
    <Suspense fallback={<AppShell><Topbar title="Prontuário" subtitle="Prontuário do paciente" /></AppShell>}>
      <ProntuarioPageInner />
    </Suspense>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  MEDICAL_ATTACHMENT: "Anexo",
  PHYSICAL_SIGNATURE: "Assinatura fisica",
  ELECTRONIC_SIGNATURE: "Assinatura eletronica",
};

function isImage(url: string) {
  return /\.(png|jpe?g|webp)$/i.test(url);
}

function ProntuarioPageInner() {
  const params = useSearchParams();
  const patientId = params.get("patientId") ?? "";

  const [draft, setDraft] = useState<Draft>({
    assessment: "",
    procedures: "",
    treatmentPlan: "",
    vitals: { paSistolica: "", paDiastolica: "", temperatura: "" },
  });
  const [recordId, setRecordId] = useState<string | null>(null);
  const [odontogram, setOdontogram] = useState<OdontogramaState>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [anamnesisFields, setAnamnesisFields] = useState<FormFieldDto[]>([]);
  const [anamnesisAnswers, setAnamnesisAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const physicalRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    adminApi.getFormSettings()
      .then((s) => setAnamnesisFields((s?.fields ?? []) as FormFieldDto[]))
      .catch(() => {});
  }, []);



  useEffect(() => {
    if (!patientId) return;
    adminApi
      .getMedicalRecordByPatient(patientId)
      .then((rec: any) => {
        if (!rec) return;
        setRecordId(rec.id);
        const content = rec.content as Record<string, any> | null;
        if (!content) return;
        const rawVitals = content.vitals;
        const vitals: Vitals =
          rawVitals && typeof rawVitals === "object"
            ? {
                paSistolica: rawVitals.paSistolica ?? "",
                paDiastolica: rawVitals.paDiastolica ?? "",
                temperatura: rawVitals.temperatura ?? "",
              }
            : { paSistolica: "", paDiastolica: "", temperatura: "" };
        setDraft({
          assessment: content.assessment ?? "",
          procedures: content.procedures ?? "",
          treatmentPlan: content.treatmentPlan ?? "",
          vitals,
        });
        const odo = content.odontogram;
        if (odo && typeof odo === "object") setOdontogram(odo as OdontogramaState);
        const anam = content.anamnesis;
        if (Array.isArray(anam)) {
          const answers: Record<string, string> = {};
          anam.forEach((a: any) => { answers[a.key] = a.value; });
          setAnamnesisAnswers(answers);
        }
      })
      .catch(() => {});
  }, [patientId]);

  async function loadAttachments(id: string) {
    try {
      const list: any = await adminApi.listMedicalAttachments(id);
      if (Array.isArray(list)) setAttachments(list);
    } catch {}
  }

  useEffect(() => {
    if (recordId) loadAttachments(recordId);
  }, [recordId]);

  function bind<K extends keyof Omit<Draft, "vitals">>(key: K) {
    return {
      value: draft[key] as string,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
        setDraft((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  function bindVital(key: keyof Vitals) {
    return {
      id: `pr-vital-${key}`,
      value: draft.vitals[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft((d) => ({ ...d, vitals: { ...d.vitals, [key]: e.target.value } })),
    };
  }

  async function save() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const anamnesisData = anamnesisFields
        .filter((f) => anamnesisAnswers[f.key]?.trim())
        .map((f) => ({ key: f.key, label: f.label, value: anamnesisAnswers[f.key] }));
      const rec: any = await adminApi.createMedicalRecord({
        patientId,
        content: { ...draft, odontogram, anamnesis: anamnesisData },
      });
      setRecordId(rec?.id ?? null);
      setSuccess("Prontuário salvo.");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar prontuário");
    } finally {
      setSaving(false);
    }
  }

  async function onAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !recordId) return;
    try {
      const att: any = await adminApi.uploadMedicalAttachment(recordId, file);
      setAttachments((prev) => [
        ...prev,
        { id: att?.id ?? String(Date.now()), fileUrl: att?.fileUrl ?? "", category: att?.category },
      ]);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao enviar anexo");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onPhysicalSig(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !recordId) return;
    try {
      await adminApi.uploadPhysicalSignature(recordId, file);
      setSuccess("Assinatura física registrada.");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao enviar assinatura");
    }
  }

  async function genLink() {
    if (!recordId) return;
    try {
      const res: any = await adminApi.generateSignatureLink(recordId);
      const token = res?.token ?? res?.id ?? "";
      const url = res?.url ?? `${window.location.origin}/sign/${token}`;
      setSignatureUrl(url);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao gerar link");
    }
  }

  return (
    <AppShell>
      <Topbar title="Prontuário" subtitle="Prontuário do paciente" />

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 px-3.5 py-3 rounded-2xl bg-sage-100 border border-sage-200 text-sage-600 text-sm">
          {success}
        </div>
      )}

      <div className="mb-6">
        <Odontograma value={odontogram} onChange={setOdontogram} />
      </div>

      {anamnesisFields.length > 0 && (
        <div className="mb-6 bg-white border border-sage-100 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={16} className="text-sage-600" />
            <h3 className="font-display text-lg text-ink-700">Anamnese</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {anamnesisFields.map((f) => (
              <div key={f.key}>
                <label htmlFor={`an-${f.key}`} className="block text-xs font-medium text-ink-500 mb-1.5">
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    id={`an-${f.key}`}
                    value={anamnesisAnswers[f.key] ?? ""}
                    onChange={(e) => setAnamnesisAnswers((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className={textareaCls}
                    rows={2}
                  />
                ) : (
                  <input
                    id={`an-${f.key}`}
                    value={anamnesisAnswers[f.key] ?? ""}
                    onChange={(e) => setAnamnesisAnswers((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className={inputCls}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white border border-sage-100 rounded-3xl p-6 space-y-5">
          <h2 className="font-display text-xl text-ink-700">Editor do prontuário</h2>

          <Field id="pr-assessment" label="Avaliação">
            <textarea id="pr-assessment" {...bind("assessment")} className={textareaCls} rows={3} />
          </Field>
          <Field id="pr-procedures" label="Procedimentos">
            <textarea id="pr-procedures" {...bind("procedures")} className={textareaCls} rows={3} />
          </Field>
          <Field id="pr-plan" label="Plano de tratamento">
            <textarea id="pr-plan" {...bind("treatmentPlan")} className={textareaCls} rows={3} />
          </Field>
          <div>
            <span className="block text-xs font-medium text-ink-500 mb-2">Pressão arterial</span>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="pr-vital-paSistolica" className="block text-[11px] text-ink-400 mb-1">
                  Sistólica (mmHg)
                </label>
                <input
                  {...bindVital("paSistolica")}
                  inputMode="numeric"
                  placeholder="120"
                  className={inputCls}
                />
              </div>
              <span className="text-ink-400 font-medium pt-5">/</span>
              <div className="flex-1">
                <label htmlFor="pr-vital-paDiastolica" className="block text-[11px] text-ink-400 mb-1">
                  Diastólica (mmHg)
                </label>
                <input
                  {...bindVital("paDiastolica")}
                  inputMode="numeric"
                  placeholder="80"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <Field id="pr-vital-temperatura" label="Temperatura (°C)">
            <input
              {...bindVital("temperatura")}
              inputMode="decimal"
              placeholder="36.5"
              className={inputCls}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 disabled:opacity-50 shadow-soft"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar prontuário
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-sage-100 rounded-3xl p-6">
            <h3 className="font-display text-base text-ink-700 mb-3">Anexos</h3>
            <label
              htmlFor="att-input"
              className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-sage-200 hover:border-sage-300 rounded-2xl text-xs text-ink-500 cursor-pointer"
            >
              <Paperclip size={16} />
              {recordId ? "Selecionar arquivo" : "Salve o prontuário antes de anexar"}
            </label>
            <input
              id="att-input"
              ref={fileRef}
              aria-label="Anexar arquivo"
              type="file"
              className="hidden"
              disabled={!recordId}
              onChange={onAttachmentChange}
            />

            {attachments.length > 0 && (
              <ul className="space-y-2 mt-4">
                {attachments.map((a) => {
                  const fileName = a.fileUrl.split("/").pop() ?? "";
                  const categoryLabel = CATEGORY_LABELS[a.category ?? ""] ?? "Anexo";
                  return (
                    <li
                      key={a.id}
                      className="bg-cream-100 rounded-xl p-2"
                    >
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 group"
                      >
                        {isImage(a.fileUrl) ? (
                          <img
                            src={a.fileUrl}
                            alt={fileName}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-sage-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-ink-600 truncate group-hover:underline flex items-center gap-1">
                            {fileName}
                            <ExternalLink size={10} className="shrink-0 opacity-0 group-hover:opacity-100" />
                          </div>
                          <div className="text-[10px] text-ink-400">{categoryLabel}</div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-white border border-sage-100 rounded-3xl p-6">
            <h3 className="font-display text-base text-ink-700 mb-3">Assinatura</h3>
            <div className="space-y-2">
              <button
                onClick={() => physicalRef.current?.click()}
                disabled={!recordId}
                className="w-full text-xs px-3 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 disabled:opacity-50"
              >
                Enviar assinatura física (arquivo)
              </button>
              <input
                ref={physicalRef}
                type="file"
                aria-label="Assinatura física"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={onPhysicalSig}
              />
              <button
                onClick={genLink}
                disabled={!recordId}
                className="w-full inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-xl bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-50"
              >
                <FileSignature size={13} />
                Gerar link de assinatura eletrônica
              </button>
              {signatureUrl && <SignatureLinkBox url={signatureUrl} />}
            </div>
          </div>
        </div>
      </div>

    </AppShell>
  );
}

function SignatureLinkBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-cream-100 rounded-xl p-3 text-[11px] text-ink-500">
      <div className="flex flex-col items-center mb-3 p-3 bg-white rounded-lg" data-testid="signature-qr">
        <QRCodeSVG value={url} size={140} bgColor="#FFFFFF" fgColor="#136E89" />
      </div>
      <div className="font-mono break-all mb-2">{url}</div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-xs text-sage-600 hover:underline inline-flex items-center gap-1"
      >
        <Copy size={11} />
        {copied ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white";
const textareaCls = `${inputCls} resize-y`;

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-ink-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
