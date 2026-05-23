"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import {
  Save,
  Copy,
  Paperclip,
  X,
  AlertCircle,
  Loader2,
  FileSignature,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { adminApi } from "@/src/lib/frontend-api";
import { Odontograma, type OdontogramaState } from "@/components/Odontograma";

type Draft = {
  assessment: string;
  procedures: string;
  treatmentPlan: string;
  vitals: string;
};

type Attachment = { id: string; fileUrl: string };
type PrevRecord = { id: string; title: string; date: string };

export default function ProntuarioPage() {
  return (
    <Suspense fallback={<AppShell><Topbar title="Prontuário" subtitle="Atendimento atual" /></AppShell>}>
      <ProntuarioPageInner />
    </Suspense>
  );
}

function ProntuarioPageInner() {
  const params = useSearchParams();
  const appointmentId = params.get("appointmentId") ?? "";
  const patientId = params.get("patientId") ?? "";

  const [draft, setDraft] = useState<Draft>({
    assessment: "",
    procedures: "",
    treatmentPlan: "",
    vitals: "",
  });
  const [recordId, setRecordId] = useState<string | null>(null);
  const [odontogram, setOdontogram] = useState<OdontogramaState>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [previous, setPrevious] = useState<PrevRecord[]>([]);
  const [openDup, setOpenDup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const physicalRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!patientId) return;
    adminApi
      .patientTimeline(patientId)
      .then(async (events: any) => {
        const records = ((events as any[]) ?? [])
          .filter((e) => e.type === "MEDICAL_RECORD")
          .map((e) => ({ id: e.id, title: e.title, date: e.date }));
        setPrevious(records);
        if (records.length > 0) {
          try {
            const latest: any = await adminApi.getMedicalRecord(records[0].id);
            const odo = latest?.content?.odontogram;
            if (odo && typeof odo === "object") setOdontogram(odo as OdontogramaState);
          } catch {}
        }
      })
      .catch(() => setPrevious([]));
  }, [patientId]);

  function bind<K extends keyof Draft>(key: K) {
    return {
      value: draft[key],
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
        setDraft((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  async function save() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const rec: any = await adminApi.createMedicalRecord({
        appointmentId,
        content: { ...draft, odontogram },
      });
      setRecordId(rec?.id ?? null);
      setSuccess("Prontuário salvo.");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar prontuário");
    } finally {
      setSaving(false);
    }
  }

  async function duplicate(prevId: string) {
    setError(null);
    try {
      const rec: any = await adminApi.duplicateMedicalRecord(prevId);
      if (rec?.content) {
        const { odontogram: odo, ...rest } = rec.content as Record<string, unknown>;
        setDraft((d) => ({ ...d, ...(rest as Partial<Draft>) }));
        if (odo && typeof odo === "object") setOdontogram(odo as OdontogramaState);
      }
      if (rec?.id) setRecordId(rec.id);
      setOpenDup(false);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao duplicar prontuário");
    }
  }

  async function onAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !recordId) return;
    try {
      const att: any = await adminApi.uploadMedicalAttachment(recordId, file);
      setAttachments((prev) => [
        ...prev,
        { id: att?.id ?? String(Date.now()), fileUrl: att?.fileUrl ?? "" },
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
      <Topbar title="Prontuário" subtitle="Atendimento atual" />

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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-sage-100 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink-700">Editor do prontuário</h2>
            <button
              onClick={() => setOpenDup(true)}
              aria-label="Duplicar prontuário anterior"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs text-sage-600 bg-sage-100 hover:bg-sage-200"
            >
              <Copy size={13} /> Duplicar prontuário anterior
            </button>
          </div>

          <Field id="pr-assessment" label="Avaliação">
            <textarea id="pr-assessment" {...bind("assessment")} className={textareaCls} rows={3} />
          </Field>
          <Field id="pr-procedures" label="Procedimentos">
            <textarea id="pr-procedures" {...bind("procedures")} className={textareaCls} rows={3} />
          </Field>
          <Field id="pr-plan" label="Plano de tratamento">
            <textarea id="pr-plan" {...bind("treatmentPlan")} className={textareaCls} rows={3} />
          </Field>
          <Field id="pr-vitals" label="Sinais vitais">
            <input id="pr-vitals" {...bind("vitals")} className={inputCls} />
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
              <ul className="grid grid-cols-2 gap-2 mt-4">
                {attachments.map((a) => (
                  <li
                    key={a.id}
                    className="text-[11px] text-ink-500 bg-cream-100 rounded-xl p-2 truncate"
                  >
                    {a.fileUrl.split("/").pop()}
                  </li>
                ))}
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

      {openDup && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-ink-700/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenDup(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sage-100">
              <h2 className="font-display text-xl text-ink-700">Duplicar prontuário anterior</h2>
              <button
                onClick={() => setOpenDup(false)}
                aria-label="Fechar"
                className="w-9 h-9 rounded-full hover:bg-cream-100 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {previous.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-6">
                  Nenhum prontuário anterior encontrado.
                </p>
              ) : (
                <ul className="space-y-2">
                  {previous.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-sage-100 hover:bg-cream-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink-700 truncate">{p.title}</div>
                        <div className="text-xs text-ink-400">{p.date}</div>
                      </div>
                      <button
                        onClick={() => duplicate(p.id)}
                        className="text-xs px-3 py-1.5 rounded-full bg-sage-400 text-white hover:bg-sage-500"
                      >
                        Usar como base
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
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
