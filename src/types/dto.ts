export type UserRole = 'MASTER' | 'ADMIN';

export type UserSession = {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  tenantSlug?: string | null;
  accessToken: string;
};

export type ServiceDto = {
  id: string;
  name: string;
  durationMinutes: number;
  isActive: boolean;
};

export type ScheduleDto = {
  id: string;
  weekDay: number;
  startTime: string;
  endTime: string;
};

export type FormFieldDto = {
  key: string;
  label: string;
  type: string;
};

export type PatientDto = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
};

export type AppointmentDto = {
  id: string;
  patientId: string;
  serviceId: string;
  date: string;
  time: string;
};

export type MedicalRecordDto = {
  id: string;
  patientId: string;
  content: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentListItemDto = {
  id: string;
  date: string;
  time: string;
  reason?: string;
  patient: { id: string; name: string; cpf: string; email: string; phone: string };
  service: { id: string; name: string; durationMinutes: number };
};
