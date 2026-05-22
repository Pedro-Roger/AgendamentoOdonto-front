import { fireEvent, render, screen } from "@testing-library/react";
import { SignatureModal } from "../src/features/assinatura/SignatureModal";

describe("Feature 04 - Assinatura", () => {
  it("alterna entre assinatura física e eletrônica", () => {
    const onPhysical = vi.fn();
    const onGenerateLink = vi.fn();

    render(<SignatureModal onSubmitPhysical={onPhysical} onGenerateElectronicLink={onGenerateLink} />);

    fireEvent.change(screen.getByLabelText("Arquivo da assinatura física"), {
      target: { files: [new File(["img"], "assinatura.jpg", { type: "image/jpeg" })] }
    });

    expect(onPhysical).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Assinatura eletrônica" }));
    fireEvent.click(screen.getByRole("button", { name: "Gerar link" }));

    expect(onGenerateLink).toHaveBeenCalledTimes(1);
  });
});
