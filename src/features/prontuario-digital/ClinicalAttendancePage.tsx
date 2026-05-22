import React from "react";

type PreviousRecord = {
  id: string;
  label: string;
};

type ClinicalAttendancePageProps = {
  previousRecords: PreviousRecord[];
  onDuplicateFromPrevious: (id: string) => void;
  onUploadAttachment: (file: File) => void;
};

export function ClinicalAttendancePage({
  previousRecords,
  onDuplicateFromPrevious,
  onUploadAttachment
}: ClinicalAttendancePageProps) {
  const firstRecord = previousRecords[0];

  return (
    <section>
      <h1>Atendimento Clínico</h1>
      <button
        type="button"
        onClick={() => firstRecord && onDuplicateFromPrevious(firstRecord.id)}
      >
        Duplicar de consulta anterior
      </button>

      <label htmlFor="attachment">Upload de anexos</label>
      <input
        id="attachment"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUploadAttachment(file);
        }}
      />
    </section>
  );
}
