"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewAppointmentModal } from "./NewAppointmentModal";

export function NewAppointmentButton({ label = "Novo agendamento" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 transition-colors shadow-soft"
      >
        <Plus size={16} strokeWidth={2.4} />
        {label}
      </button>
      <NewAppointmentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
