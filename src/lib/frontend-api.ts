import { AppointmentDto, AppointmentListItemDto, FormFieldDto, MedicalRecordDto, PatientDto, ScheduleDto, ServiceDto } from '../types/dto';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    },
  });

  const raw = await response.text();
  let data: any = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Erro de comunicação com o servidor (status ${response.status})`);
    }
  }
  if (response.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error(data?.message ?? 'Sessão expirada');
  }
  if (!response.ok) {
    throw new Error(data?.message ?? `Erro ${response.status}`);
  }
  return data as T;
}

export type BookingBody = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
  reason?: string;
  anamnesisAnswers: Array<{ key: string; value: string }>;
};

export const adminApi = {
  listServices: () => req<ServiceDto[]>('api/services'),
  availability: (serviceId: string, date: string) =>
    req<ScheduleDto[]>(`api/appointments/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`),
  createAppointment: (body: BookingBody) =>
    req<AppointmentDto>('api/appointments', { method: 'POST', body: JSON.stringify(body) }),
  createService: (body: { name: string; durationMinutes: number }) => req<ServiceDto>('api/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id: string, body: Partial<ServiceDto>) => req<ServiceDto>(`api/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  listSchedules: () => req<ScheduleDto[]>('api/schedules'),
  createSchedule: (body: { weekDay: number; startTime: string; endTime: string }) => req<ScheduleDto>('api/schedules', { method: 'POST', body: JSON.stringify(body) }),
  replaceSchedules: (body: Array<{ weekDay: number; startTime: string; endTime: string }>) => req<ScheduleDto[]>('api/schedules', { method: 'PUT', body: JSON.stringify(body) }),

  getFormSettings: () => req<{ id: string; fields: FormFieldDto[]; createdAt: string }>('api/form-settings'),
  createFormSettings: (fields: FormFieldDto[]) => req('api/form-settings', { method: 'POST', body: JSON.stringify({ fields }) }),

  createMedicalRecord: (body: { patientId: string; content: Record<string, unknown> }) => req('api/medical-records', { method: 'POST', body: JSON.stringify(body) }),
  getMedicalRecordByPatient: (patientId: string) => req(`api/medical-records/patient/${patientId}`),
  listMedicalRecordsByPatient: (patientId: string) => req<MedicalRecordDto[]>(`api/medical-records/patient/${patientId}/history`),
  createNewMedicalRecord: (patientId: string, content: Record<string, unknown>) => req<MedicalRecordDto>(`api/medical-records/patient/${patientId}/new`, { method: 'POST', body: JSON.stringify({ content }) }),
  updateMedicalRecord: (id: string, content: Record<string, unknown>) => req<MedicalRecordDto>(`api/medical-records/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  duplicateMedicalRecord: (id: string) => req(`api/medical-records/${id}/duplicate`, { method: 'POST' }),
  getMedicalRecord: (id: string) => req<MedicalRecordDto>(`api/medical-records/${id}`),
  listMedicalAttachments: (recordId: string) => req(`api/medical-records/${recordId}/attachments`),
  uploadMedicalAttachment: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return req(`api/medical-records/${id}/attachments`, { method: 'POST', body: form });
  },

  uploadPhysicalSignature: (medicalRecordId: string, file: File) => {
    const form = new FormData();
    form.append('medicalRecordId', medicalRecordId);
    form.append('file', file);
    return req('api/signatures/physical', { method: 'POST', body: form });
  },
  generateSignatureLink: (medicalRecordId: string) => req('api/signatures/electronic/generate-link', { method: 'POST', body: JSON.stringify({ medicalRecordId }) }),

  listPatients: (q?: string) => req<PatientDto[]>(`api/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  deletePatient: (id: string) => req<{ deleted: boolean; id: string }>(`api/patients/${id}`, { method: 'DELETE' }),
  listAppointments: (date?: string) => req<AppointmentListItemDto[]>(`api/appointments${date ? `?date=${encodeURIComponent(date)}` : ''}`),
  listAppointmentsWeek: (from: string, to: string) => req<AppointmentListItemDto[]>(`api/appointments/week?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  patientProfile: (id: string) => req(`api/patients/${id}/profile`),
  patientTimeline: (id: string) => req(`api/patients/${id}/timeline`),

  listUsers: () => req<UserAdminDto[]>('api/users'),
  createUser: (body: { name: string; email: string; password: string; role: 'MASTER' | 'ADMIN' | 'DENTISTA' | 'RECEPCIONISTA' }) =>
    req<UserAdminDto>('api/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id: string, body: Partial<{ name: string; email: string; password: string; role: 'MASTER' | 'ADMIN' | 'DENTISTA' | 'RECEPCIONISTA'; isActive: boolean }>) =>
    req<UserAdminDto>(`api/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  getWhatsAppStatus: () => req<{ status: string; qr: string | null }>('api/whatsapp/status'),
  getWhatsAppConfig: () => req('api/whatsapp/config'),
  saveWhatsAppConfig: (body: { clinicName: string; clinicAddress: string }) =>
    req('api/whatsapp/config', { method: 'POST', body: JSON.stringify(body) }),
  resetWhatsAppSession: () => req('api/whatsapp/session', { method: 'DELETE' }),
  testWhatsApp: (phone: string) =>
    req<{ sent: boolean }>('api/whatsapp/test', { method: 'POST', body: JSON.stringify({ phone }) }),

  listNotifications: () => req<NotificationDto[]>('api/notifications'),
  unreadNotifications: () => req<NotificationDto[]>('api/notifications/unread'),
  markNotificationRead: (id: string) => req(`api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => req('api/notifications/read-all', { method: 'PATCH' }),
};

export type NotificationDto = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  readAt: string | null;
  createdAt: string;
};

export type UserAdminDto = {
  id: string;
  name: string;
  email: string;
  role: 'MASTER' | 'ADMIN' | 'DENTISTA' | 'RECEPCIONISTA';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const publicApi = {
  services: (slug: string) => req<ServiceDto[]>(`api/public/${slug}/services`),
  formSettings: (slug: string) => req<{ id: string; fields: FormFieldDto[] }>(`api/public/${slug}/form-settings`),
  availability: (slug: string, serviceId: string, date: string) =>
    req<ScheduleDto[]>(`api/public/${slug}/available-schedules?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`),
  createAppointment: (slug: string, body: BookingBody) =>
    req<AppointmentDto>(`api/public/${slug}/appointments`, { method: 'POST', body: JSON.stringify(body) }),
};

export type DashboardSummary = {
  totalAppointments: number;
  newPatients: number;
  revenue: number;
  appointmentsByDay: { date: string; count: number }[];
  appointmentsByService: { name: string; count: number }[];
  appointmentsBySource: { source: string; count: number }[];
  upcomingToday: number;
};

export const dashboardApi = {
  summary: (from: string, to: string) =>
    req<DashboardSummary>(`api/dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
};

export type ApiKeyDto = {
  id: string;
  name: string;
  prefix: string;
  allowedOrigins: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export const apiKeysApi = {
  list: () => req<ApiKeyDto[]>('api/api-keys'),
  create: (body: { name: string; allowedOrigins: string[] }) =>
    req<ApiKeyDto & { plaintextKey: string }>('api/api-keys', { method: 'POST', body: JSON.stringify(body) }),
  revoke: (id: string) => req(`api/api-keys/${id}`, { method: 'DELETE' }),
};
