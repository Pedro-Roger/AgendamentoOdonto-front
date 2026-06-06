"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
  Search,
  Plus,
  User,
  ChevronRight,
  CalendarDays,
  Clock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { adminApi } from "@/src/lib/frontend-api";
import { Odontograma, type OdontogramaState } from "@/components/Odontograma";
import type { AppointmentListItemDto, FormFieldDto, MedicalRecordDto, PatientDto } from "@/src/types/dto";

// ─── Types ────────────────────────────────────────────────────────────────────

type Vitals = { paSistolica: string; paDiastolica: string; temperatura: string };
type Draft  = { assessment: string; procedures: string; treatmentPlan: string; vitals: Vitals };
type Attachment = { id: string; fileUrl: string; category?: string };

const EMPTY_DRAFT: Draft = {
  assessment: "",
  procedures: "",
  treatmentPlan: "",
  vitals: { paSistolica: "", paDiastolica: "", temperatura: "" },
};

const CATEGORY_LABELS: Record<string, string> = {
  MEDICAL_ATTACHMENT: "Anexo",
  PHYSICAL_SIGNATURE: "Assinatura física",
  ELECTRONIC_SIGNATURE: "Assinatura eletrônica",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isImage(url: string) {
  return /\.(png|jpe?g|webp)$/i.test(url);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white";
const textareaCls = `${inputCls} resize-y`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProntuarioPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <Topbar title="Prontuário" subtitle="Atendimento clínico" />
        </AppShell>
      }
    >
      <ProntuarioPageInner />
    </Suspense>
  );
}

function ProntuarioPageInner() {
  // ── Patient panel state ───────────────────────────────────────────────────
  const [tab, setTab] = useState<"hoje" | "todos">("hoje");
  const [search, setSearch] = useState("");
  const [allPatients, setAllPatients] = useState<PatientDto[]>([]);
  const [todayAppts, setTodayAppts] = useState<AppointmentListItemDto[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // ── Selected patient ─────────────────────────────────────────────────────
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [records, setRecords] = useState<MedicalRecordDto[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // ── Editor state ──────────────────────────────────────────────────────────
  const [recordId, setRecordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [odontogram, setOdontogram] = useState<OdontogramaState>({});
  const [anamnesisFields, setAnamnesisFields] = useState<FormFieldDto[]>([]);
  const [anamnesisAnswers, setAnamnesisAnswers] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Mobile ────────────────────────────────────────────────────────────────
  const [showEditor, setShowEditor] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const physicalRef = useRef<HTMLInputElement | null>(null);

  // Load form settings once
  useEffect(() => {
    adminApi.getFormSettings()
      .then((s) => setAnamnesisFields((s?.fields ?? []) as FormFieldDto[]))
      .catch(() => {});
  }, []);

  // Load today's appointments
  useEffect(() => {
    setLoadingPatients(true);
    adminApi.listAppointments(todayISO())
      .then((appts) => setTodayAppts(appts ?? []))
      .catch(() => {})
      .finally(() => setLoadingPatients(false));
  }, []);

  // Load all patients when switching to "todos" tab or searching
  useEffect(() => {
    if (tab === "todos" || search) {
      setLoadingPatients(true);
      adminApi.listPatients(search || undefined)
        .then((p) => setAllPatients(p ?? []))
        .catch(() => {})
        .finally(() => setLoadingPatients(false));
    }
  }, [tab, search]);

  // ── Patient list to show ──────────────────────────────────────────────────
  const patientListItems: { patient: PatientDto; time?: string }[] = tab === "hoje"
    ? todayAppts
        .filter((a) => !search || a.patient.name.toLowerCase().includes(search.toLowerCase()))
        .map((a) => ({ patient: a.patient, time: a.time }))
    : allPatients.map((p) => ({ patient: p }));

  // ── Select patient ────────────────────────────────────────────────────────
  const selectPatient = useCallback(async (patient: PatientDto) => {
    setSelectedPatient(patient);
    setShowEditor(true);
    setError(null);
    setSuccess(null);
    setRecordId(null);
    setDraft(EMPTY_DRAFT);
    setOdontogram({});
    setAnamnesisAnswers({});
    setAttachments([]);
    setSignatureUrl(null);
    setRecords([]);
    setLoadingRecords(true);

    try {
      const history = await adminApi.listMedicalRecordsByPatient(patient.id);
      setRecords(history ?? []);

      // Auto-load most recent record
      if (history && history.length > 0) {
        loadRecord(history[0]);
      }
    } catch {
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load a specific record into the editor ────────────────────────────────
  function loadRecord(rec: MedicalRecordDto) {
    setRecordId(rec.id);
    setSignatureUrl(null);
    const c = rec.content as Record<string, any>;
    const rawVitals = c?.vitals;
    const vitals: Vitals =
      rawVitals && typeof rawVitals === "object"
        ? {
            paSistolica: rawVitals.paSistolica ?? "",
            paDiastolica: rawVitals.paDiastolica ?? "",
            temperatura: rawVitals.temperatura ?? "",
          }
        : { paSistolica: "", paDiastolica: "", temperatura: "" };

    setDraft({
      assessment: c?.assessment ?? "",
      procedures: c?.procedures ?? "",
      treatmentPlan: c?.treatmentPlan ?? "",
      vitals,
    });

    const odo = c?.odontogram;
    if (odo && typeof odo === "object") setOdontogram(odo as OdontogramaState);
    else setOdontogram({});

    const anam = c?.anamnesis;
    if (Array.isArray(anam)) {
      const answers: Record<string, string> = {};
      anam.forEach((a: any) => { answers[a.key] = a.value; });
      setAnamnesisAnswers(answers);
    } else {
      setAnamnesisAnswers({});
    }

    // Load attachments
    adminApi.listMedicalAttachments(rec.id)
      .then((list: any) => { if (Array.isArray(list)) setAttachments(list); })
      .catch(() => {});
  }

  // ── Start new record ──────────────────────────────────────────────────────
  function startNew() {
    setRecordId(null);
    setDraft(EMPTY_DRAFT);
    setOdontogram({});
    setAnamnesisAnswers({});
    setAttachments([]);
    setSignatureUrl(null);
    setError(null);
    setSuccess(null);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function save() {
    if (!selectedPatient) return;
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const anamnesisData = anamnesisFields
        .filter((f) => anamnesisAnswers[f.key]?.trim())
        .map((f) => ({ key: f.key, label: f.label, value: anamnesisAnswers[f.key] }));
      const content = { ...draft, odontogram, anamnesis: anamnesisData };

      let saved: MedicalRecordDto;
      if (recordId) {
        saved = await adminApi.updateMedicalRecord(recordId, content);
      } else {
        saved = await adminApi.createNewMedicalRecord(selectedPatient.id, content);
        // Add to history list
        setRecords((prev) => [saved, ...prev]);
      }
      setRecordId(saved.id);
      setSuccess("Prontuário salvo.");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar prontuário");
    } finally {
      setSaving(false);
    }
  }

  // ── Attachments ───────────────────────────────────────────────────────────
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

  // ── Bind helpers ──────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <Topbar title="Prontuário" subtitle="Atendimento clínico" />

      <div className="flex gap-0 lg:gap-5 items-start -mx-4 sm:-mx-6 lg:mx-0 mt-2">

        {/* ── Patient Panel ── */}
        <div
          className={`
            ${showEditor ? "hidden lg:flex" : "flex"}
            flex-col w-full lg:w-72 shrink-0
            bg-white border-r lg:border lg:rounded-3xl border-sage-100
            lg:sticky lg:top-6
            overflow-hidden
          `}
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {/* Search + Tabs */}
          <div className="p-4 space-y-3 border-b border-sage-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Buscar paciente…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300"
              />
            </div>
            <div className="flex bg-cream-100 rounded-2xl p-1 gap-1">
              {(["hoje", "todos"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    tab === t
                      ? "bg-white text-ink-700 shadow-soft"
                      : "text-ink-500 hover:text-ink-700"
                  }`}
                >
                  {t === "hoje" ? "Agendados hoje" : "Todos"}
                </button>
              ))}
            </div>
          </div>

          {/* Patient list */}
          <div className="flex-1 overflow-y-auto p-2">
            {loadingPatients ? (
              <div className="flex justify-center py-8">
                <Loader2 size={18} className="animate-spin text-sage-400" />
              </div>
            ) : patientListItems.length === 0 ? (
              <div className="text-center py-10 text-sm text-ink-400">
                {tab === "hoje" ? "Nenhum agendamento hoje" : "Nenhum paciente encontrado"}
              </div>
            ) : (
              <ul className="space-y-0.5">
                {patientListItems.map(({ patient, time }) => (
                  <li key={patient.id}>
                    <button
                      onClick={() => selectPatient(patient)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
                        selectedPatient?.id === patient.id
                          ? "bg-sage-50 text-sage-700"
                          : "hover:bg-cream-100 text-ink-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(patient.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{patient.name}</div>
                        {time && (
                          <div className="flex items-center gap-1 text-[11px] text-ink-400">
                            <Clock size={10} /> {time}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-ink-300 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Editor Area ── */}
        <div
          className={`
            ${showEditor ? "flex" : "hidden lg:flex"}
            flex-col flex-1 min-w-0
            px-4 sm:px-6 lg:px-0
            pb-6 space-y-5
          `}
        >
          {/* Mobile back button */}
          {showEditor && (
            <button
              onClick={() => setShowEditor(false)}
              className="lg:hidden flex items-center gap-2 text-sm text-sage-600 font-medium mb-1"
            >
              ← Pacientes
            </button>
          )}

          {!selectedPatient ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-3xl bg-sage-50 flex items-center justify-center mb-4">
                <User size={28} className="text-sage-300" />
              </div>
              <h3 className="font-display text-lg text-ink-600 mb-1">Selecione um paciente</h3>
              <p className="text-sm text-ink-400 max-w-xs">
                Escolha um paciente na lista à esquerda para abrir ou criar um prontuário.
              </p>
            </div>
          ) : (
            <>
              {/* Alerts */}
              {error && (
                <div role="alert" className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="px-3.5 py-3 rounded-2xl bg-sage-50 border border-sage-200 text-sage-700 text-sm">
                  {success}
                </div>
              )}

              {/* Patient header */}
              <div className="flex items-center gap-3 bg-white border border-sage-100 rounded-3xl px-5 py-4">
                <div className="w-11 h-11 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {initials(selectedPatient.name)}
                </div>
                <div>
                  <div className="font-display text-lg text-ink-700">{selectedPatient.name}</div>
                  <div className="text-xs text-ink-400">{selectedPatient.email}</div>
                </div>
              </div>

              {/* History bar */}
              <div className="bg-white border border-sage-100 rounded-3xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays size={13} className="text-sage-500" />
                  <span className="text-xs font-medium text-ink-500">Histórico de prontuários</span>
                </div>
                {loadingRecords ? (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2 size={14} className="animate-spin text-sage-400" />
                    <span className="text-xs text-ink-400">Carregando…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {/* New button */}
                    <button
                      onClick={startNew}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                        recordId === null && records.length > 0
                          ? "bg-sage-400 text-white"
                          : "bg-cream-100 hover:bg-cream-200 text-ink-600"
                      }`}
                    >
                      <Plus size={11} />
                      Novo
                    </button>

                    {records.length === 0 && (
                      <span className="text-xs text-ink-400 italic">Nenhum prontuário criado ainda</span>
                    )}

                    {records.map((r, i) => (
                      <button
                        key={r.id}
                        onClick={() => loadRecord(r)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 whitespace-nowrap transition-colors ${
                          recordId === r.id
                            ? "bg-sage-400 text-white"
                            : "bg-cream-100 hover:bg-cream-200 text-ink-600"
                        }`}
                      >
                        {fmtDate(r.updatedAt)}
                        {i === 0 && (
                          <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                            recordId === r.id ? "bg-white/20 text-white" : "bg-sage-100 text-sage-600"
                          }`}>
                            Atual
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Odontogram */}
              <div>
                <Odontograma value={odontogram} onChange={setOdontogram} />
              </div>

              {/* Anamnesis */}
              {anamnesisFields.length > 0 && (
                <div className="bg-white border border-sage-100 rounded-3xl p-6">
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

              {/* Editor + side panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main editor */}
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

                  {/* Blood pressure */}
                  <div>
                    <span className="block text-xs font-medium text-ink-500 mb-2">Pressão arterial</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label htmlFor="pr-vital-paSistolica" className="block text-[11px] text-ink-400 mb-1">Sistólica (mmHg)</label>
                        <input {...bindVital("paSistolica")} inputMode="numeric" placeholder="120" className={inputCls} />
                      </div>
                      <span className="text-ink-400 font-medium pt-5">/</span>
                      <div className="flex-1">
                        <label htmlFor="pr-vital-paDiastolica" className="block text-[11px] text-ink-400 mb-1">Diastólica (mmHg)</label>
                        <input {...bindVital("paDiastolica")} inputMode="numeric" placeholder="80" className={inputCls} />
                      </div>
                    </div>
                  </div>

                  <Field id="pr-vital-temperatura" label="Temperatura (°C)">
                    <input {...bindVital("temperatura")} inputMode="decimal" placeholder="36.5" className={inputCls} />
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

                {/* Attachments + Signature */}
                <div className="space-y-5">
                  {/* Attachments */}
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
                            <li key={a.id} className="bg-cream-100 rounded-xl p-2">
                              <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group">
                                {isImage(a.fileUrl) ? (
                                  <img src={a.fileUrl} alt={fileName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
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

                  {/* Signature */}
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
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
