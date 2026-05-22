import { fireEvent, render, screen } from "@testing-library/react";
import { ClinicalAttendancePage } from "../src/features/prontuario-digital/ClinicalAttendancePage";

describe("Feature 03 - Prontuário Digital", () => {
  it("permite duplicar prontuário anterior e enviar anexo", async () => {
    const onDuplicate = vi.fn();
    const onUpload = vi.fn();

    render(
      <ClinicalAttendancePage
        previousRecords={[{ id: "mr-001", label: "Prontuário #001" }]}
        onDuplicateFromPrevious={onDuplicate}
        onUploadAttachment={onUpload}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Duplicar de consulta anterior" }));
    expect(onDuplicate).toHaveBeenCalledWith("mr-001");

    const file = new File(["xray"], "xray.png", { type: "image/png" });
    const input = screen.getByLabelText("Upload de anexos");
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
