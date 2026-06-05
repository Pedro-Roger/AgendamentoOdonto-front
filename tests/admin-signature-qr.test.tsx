import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    createMedicalRecord: vi.fn(),
    getMedicalRecordByPatient: vi.fn(),
    getFormSettings: vi.fn(),
    listMedicalAttachments: vi.fn(),
    duplicateMedicalRecord: vi.fn(),
    uploadMedicalAttachment: vi.fn(),
    uploadPhysicalSignature: vi.fn(),
    generateSignatureLink: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("patientId=p1"),
  usePathname: () => "/prontuario",
  useRouter: () => ({ push: () => {}, replace: () => {} }),
}));

import { adminApi } from "@/src/lib/frontend-api";
import ProntuarioPage from "../app/prontuario/page";

describe("SDD Phase 3 / Slice 7 — Signature QR + copy link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getMedicalRecordByPatient).mockResolvedValue(null as any);
    vi.mocked(adminApi.getFormSettings).mockResolvedValue({ id: "", fields: [], createdAt: "" });
    vi.mocked(adminApi.listMedicalAttachments).mockResolvedValue([] as any);
  });

  it("renders QR code + copyable link after generating electronic signature", async () => {
    vi.mocked(adminApi.createMedicalRecord).mockResolvedValue({ id: "rec1" } as any);
    vi.mocked(adminApi.generateSignatureLink).mockResolvedValue({
      token: "tok123",
      url: "https://app.local/sign/tok123",
    } as any);

    render(<ProntuarioPage />);
    fireEvent.change(screen.getByLabelText(/avalia[çc][ãa]o/i), { target: { value: "x" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /salvar prontu[áa]rio/i }));
    });
    await waitFor(() => expect(adminApi.createMedicalRecord).toHaveBeenCalled(), { timeout: 3000 });

    // Flush all pending state updates (recordId set, listMedicalAttachments called)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /gerar link de assinatura/i }));
    });

    await waitFor(() => {
      expect(adminApi.generateSignatureLink).toHaveBeenCalledWith("rec1");
    }, { timeout: 3000 });

    expect(await screen.findByText("https://app.local/sign/tok123")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar link/i })).toBeInTheDocument();
    expect(screen.getByTestId("signature-qr")).toBeInTheDocument();
  }, 15000);
});
