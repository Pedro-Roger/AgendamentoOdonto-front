import { AppointmentDto, AppointmentListItemDto, FormFieldDto, PatientDto, ScheduleDto, ServiceDto } from '../types/dto';

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

export const adminApi = {
  listServices: () => req<ServiceDto[]>('api/services'),
  createService: (body: { name: string; durationMinutes: number }) => req<ServiceDto>('api/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id: string, body: Partial<ServiceDto>) => req<ServiceDto>(`api/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  listSchedules: () => req<ScheduleDto[]>('api/schedules'),
  createSchedule: (body: { weekDay: number; startTime: string; endTime: string }) => req<ScheduleDto>('api/schedules', { method: 'POST', body: JSON.stringify(body) }),
  replaceSchedules: (body: Array<{ weekDay: number; startTime: string; endTime: string }>) => req<ScheduleDto[]>('api/schedules', { method: 'PUT', body: JSON.stringify(body) }),

  getFormSettings: () => req<{ id: string; fields: FormFieldDto[]; createdAt: string }>('api/form-settings'),
  createFormSettings: (fields: FormFieldDto[]) => req('api/form-settings', { method: 'POST', body: JSON.stringify({ fields }) }),

  createMedicalRecord: (body: { patientId: string; content: Record<string, unknown> }) => req('api/medical-records', { method: 'POST', body: JSON.stringify(body) }),
  getMedicalRecordByPatient: (patientId: string) => req(`api/medical-records/patient/${patientId}`),
  duplicateMedicalRecord: (id: string) => req(`api/medical-records/${id}/duplicate`, { method: 'POST' }),
  getMedicalRecord: (id: string) => req(`api/medical-records/${id}`),
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
  saveWhatsAppConfig: (body: { instanceId: string; token: string; clinicName: string; clinicAddress: string; isActive: boolean }) =>
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
  availableSchedules: (serviceId: string, date: string) => req<ScheduleDto[]>(`api/public/available-schedules?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`),
  createAppointment: (body: { name: string; cpf: string; email: string; phone: string; serviceId: string; date: string; time: string; reason?: string; anamnesisAnswers: Array<{ key: string; value: string }> }) =>
    req<AppointmentDto>('api/public/appointments', { method: 'POST', body: JSON.stringify(body) }),
};

