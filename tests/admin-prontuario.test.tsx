import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    createMedicalRecord: vi.fn(),
    getMedicalRecordByPatient: vi.fn(),
    getFormSettings: vi.fn(),
    listMedicalAttachments: vi.fn(),
    uploadMedicalAttachment: vi.fn(),
    uploadPhysicalSignature: vi.fn(),
    generateSignatureLink: vi.fn(),
    duplicateMedicalRecord: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("patientId=p1"),
  usePathname: () => "/prontuario",
  useRouter: () => ({ push: () => {}, replace: () => {} }),
}));

import { adminApi } from "@/src/lib/frontend-api";
import ProntuarioPage from "../app/prontuario/page";

describe("SDD Phase 3 / Slice 6 — Prontuário editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getMedicalRecordByPatient).mockResolvedValue(null as any);
    vi.mocked(adminApi.getFormSettings).mockResolvedValue({ id: "", fields: [], createdAt: "" });
    vi.mocked(adminApi.listMedicalAttachments).mockResolvedValue([] as any);
  });

  it("renders draft form with bound inputs and saves via createMedicalRecord", async () => {
    vi.mocked(adminApi.createMedicalRecord).mockResolvedValue({ id: "rec1" } as any);

    render(<ProntuarioPage />);

    fireEvent.change(screen.getByLabelText(/avalia[çc][ãa]o/i), { target: { value: "Cárie em #16" } });
    fireEvent.change(screen.getByLabelText(/procedimentos/i), { target: { value: "Restauração resina" } });
    fireEvent.change(screen.getByLabelText(/plano de tratamento/i), { target: { value: "Retorno em 30 dias" } });
    fireEvent.change(screen.getByLabelText(/sinais vitais/i), { target: { value: "PA 120/80" } });

    fireEvent.click(screen.getByRole("button", { name: /salvar prontu[áa]rio/i }));

    await waitFor(() => {
      expect(adminApi.createMedicalRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: "p1",
          content: expect.objectContaining({
            assessment: "Cárie em #16",
            procedures: "Restauração resina",
            treatmentPlan: "Retorno em 30 dias",
            vitals: "PA 120/80",
          }),
        })
      );
    });
  });

  it("pre-fills form when patient has existing record", async () => {
    vi.mocked(adminApi.getMedicalRecordByPatient).mockResolvedValue({
      id: "rec_existing",
      content: {
        assessment: "Avaliação anterior",
        procedures: "Limpeza",
        treatmentPlan: "Retorno em 6 meses",
        vitals: "PA 120/80",
        odontogram: {},
        anamnesis: [],
      },
    } as any);

    render(<ProntuarioPage />);

    await waitFor(() => {
      const el = screen.getByLabelText(/avalia[çc][ãa]o/i) as HTMLTextAreaElement;
      expect(el.value).toBe("Avaliação anterior");
    });
  });

  it("uploads attachment when file selected after saving record", async () => {
    vi.mocked(adminApi.createMedicalRecord).mockResolvedValue({ id: "rec1" } as any);
    vi.mocked(adminApi.uploadMedicalAttachment).mockResolvedValue({
      id: "att1", fileUrl: "x", category: "MEDICAL_ATTACHMENT",
    } as any);

    render(<ProntuarioPage />);
    fireEvent.change(screen.getByLabelText(/avalia[çc][ãa]o/i), { target: { value: "a" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar prontu[áa]rio/i }));
    await waitFor(() => expect(adminApi.createMedicalRecord).toHaveBeenCalled());

    const file = new File(["x"], "raio-x.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/anexar arquivo/i), { target: { files: [file] } });

    await waitFor(() => {
      expect(adminApi.uploadMedicalAttachment).toHaveBeenCalledWith("rec1", file);
    });
  });
});
