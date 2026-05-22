import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const createMedicalRecord = vi.fn();
const generateSignatureLink = vi.fn();
const patientTimeline = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    createMedicalRecord: (...a: any[]) => createMedicalRecord(...a),
    duplicateMedicalRecord: vi.fn(),
    uploadMedicalAttachment: vi.fn(),
    uploadPhysicalSignature: vi.fn(),
    generateSignatureLink: (...a: any[]) => generateSignatureLink(...a),
    patientTimeline: (...a: any[]) => patientTimeline(...a),
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("appointmentId=appt1&patientId=p1"),
  usePathname: () => "/prontuario", useRouter: () => ({ push: () => {}, replace: () => {} }),
}));

import ProntuarioPage from "../app/prontuario/page";

describe("SDD Phase 3 / Slice 7 — Signature QR + copy link", () => {
  beforeEach(() => {
    createMedicalRecord.mockReset();
    generateSignatureLink.mockReset();
    patientTimeline.mockReset();
    patientTimeline.mockResolvedValue([]);
  });

  it("renders QR code + copyable link after generating electronic signature", async () => {
    createMedicalRecord.mockResolvedValue({ id: "rec1" });
    generateSignatureLink.mockResolvedValue({ token: "tok123", url: "https://app.local/sign/tok123" });

    render(<ProntuarioPage />);
    fireEvent.change(screen.getByLabelText(/avalia[çc][ãa]o/i), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar prontu[áa]rio/i }));
    await waitFor(() => expect(createMedicalRecord).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /gerar link de assinatura/i }));

    await waitFor(() => {
      expect(generateSignatureLink).toHaveBeenCalledWith("rec1");
    });

    expect(await screen.findByText("https://app.local/sign/tok123")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar link/i })).toBeInTheDocument();
    expect(screen.getByTestId("signature-qr")).toBeInTheDocument();
  });
});
