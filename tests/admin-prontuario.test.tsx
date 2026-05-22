import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const createMedicalRecord = vi.fn();
const duplicateMedicalRecord = vi.fn();
const uploadMedicalAttachment = vi.fn();
const uploadPhysicalSignature = vi.fn();
const generateSignatureLink = vi.fn();
const patientTimeline = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    createMedicalRecord: (...a: any[]) => createMedicalRecord(...a),
    duplicateMedicalRecord: (...a: any[]) => duplicateMedicalRecord(...a),
    uploadMedicalAttachment: (...a: any[]) => uploadMedicalAttachment(...a),
    uploadPhysicalSignature: (...a: any[]) => uploadPhysicalSignature(...a),
    generateSignatureLink: (...a: any[]) => generateSignatureLink(...a),
    patientTimeline: (...a: any[]) => patientTimeline(...a),
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams("appointmentId=appt1&patientId=p1"),
  usePathname: () => "/prontuario", useRouter: () => ({ push: () => {}, replace: () => {} }),
}));

import ProntuarioPage from "../app/prontuario/page";

describe("SDD Phase 3 / Slice 6 — Prontuário editor", () => {
  beforeEach(() => {
    createMedicalRecord.mockReset();
    duplicateMedicalRecord.mockReset();
    uploadMedicalAttachment.mockReset();
    uploadPhysicalSignature.mockReset();
    generateSignatureLink.mockReset();
    patientTimeline.mockReset();
    patientTimeline.mockResolvedValue([]);
  });

  it("renders draft form with bound inputs and saves via createMedicalRecord", async () => {
    createMedicalRecord.mockResolvedValue({ id: "rec1" });

    render(<ProntuarioPage />);

    fireEvent.change(screen.getByLabelText(/avalia[çc][ãa]o/i), {
      target: { value: "Cárie em #16" },
    });
    fireEvent.change(screen.getByLabelText(/procedimentos/i), {
      target: { value: "Restauração resina" },
    });
    fireEvent.change(screen.getByLabelText(/plano de tratamento/i), {
      target: { value: "Retorno em 30 dias" },
    });
    fireEvent.change(screen.getByLabelText(/sinais vitais/i), {
      target: { value: "PA 120/80" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar prontu[áa]rio/i }));

    await waitFor(() => {
      expect(createMedicalRecord).toHaveBeenCalledWith({
        appointmentId: "appt1",
        content: {
          assessment: "Cárie em #16",
          procedures: "Restauração resina",
          treatmentPlan: "Retorno em 30 dias",
          vitals: "PA 120/80",
        },
      });
    });
  });

  it("opens duplicate modal listing previous medical records and calls duplicateMedicalRecord", async () => {
    patientTimeline.mockResolvedValue([
      { id: "rec_prev", type: "MEDICAL_RECORD", title: "Restauração #16", date: "2026-04-01" },
      { id: "ev_appt", type: "APPOINTMENT", title: "Limpeza", date: "2026-04-15" },
    ]);
    duplicateMedicalRecord.mockResolvedValue({
      id: "rec_dup",
      content: { assessment: "copy" },
    });

    render(<ProntuarioPage />);
    fireEvent.click(await screen.findByRole("button", { name: /duplicar prontu[áa]rio/i }));

    const modal = await screen.findByRole("dialog");
    expect(within(modal).getByText(/Restaura[çc][ãa]o #16/)).toBeInTheDocument();

    fireEvent.click(within(modal).getByRole("button", { name: /usar como base/i }));

    await waitFor(() => {
      expect(duplicateMedicalRecord).toHaveBeenCalledWith("rec_prev");
    });
  });

  it("uploads attachment when file selected after saving record", async () => {
    createMedicalRecord.mockResolvedValue({ id: "rec1" });
    uploadMedicalAttachment.mockResolvedValue({ id: "att1", fileUrl: "x" });

    render(<ProntuarioPage />);
    fireEvent.change(screen.getByLabelText(/avalia[çc][ãa]o/i), { target: { value: "a" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar prontu[áa]rio/i }));
    await waitFor(() => expect(createMedicalRecord).toHaveBeenCalled());

    const file = new File(["x"], "raio-x.png", { type: "image/png" });
    const input = screen.getByLabelText(/anexar arquivo/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadMedicalAttachment).toHaveBeenCalledWith("rec1", file);
    });
  });
});
