import React, { useState } from "react";

type SignatureModalProps = {
  onSubmitPhysical: (file: File) => void;
  onGenerateElectronicLink: () => void;
};

export function SignatureModal({ onSubmitPhysical, onGenerateElectronicLink }: SignatureModalProps) {
  const [mode, setMode] = useState<"physical" | "electronic">("physical");

  return (
    <section>
      <h1>Conclusão do prontuário</h1>
      <button type="button" onClick={() => setMode("physical")}>Assinatura física</button>
      <button type="button" onClick={() => setMode("electronic")}>Assinatura eletrônica</button>

      {mode === "physical" ? (
        <div>
          <label htmlFor="physical-signature">Arquivo da assinatura física</label>
          <input
            id="physical-signature"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSubmitPhysical(file);
            }}
          />
        </div>
      ) : (
        <button type="button" onClick={onGenerateElectronicLink}>Gerar link</button>
      )}
    </section>
  );
}
