import { ApiResponse, apiRequest } from './apiClient';

export interface AdminRealtimeSnapshot {
  drivers: Record<string, unknown>[];
  clients: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  emergencies: Record<string, unknown>[];
  completedServices: Record<string, unknown>[];
  rides: Record<string, unknown>[];
  activity: Record<string, unknown>[];
  rideEvents: Record<string, unknown>[];
  stats: Record<string, unknown>;
  serverTime: string;
}

export interface ConductorRealtimeSnapshot {
  available: boolean;
  drivers: Record<string, unknown>[];
  clients: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  emergencies: Record<string, unknown>[];
  completedServices: Record<string, unknown>[];
  rides: Record<string, unknown>[];
  activity: Record<string, unknown>[];
  rideEvents: Record<string, unknown>[];
}

export interface AdminApiUser extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: number;
}

export function adminApiRequest<T>(baseUrl: string, apiKey: string, path: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(baseUrl, apiKey, path, options);
}

export function loginAdmin(baseUrl: string, apiKey: string, login: string, password: string): Promise<AdminApiUser> {
  return adminApiRequest<AdminApiUser>(baseUrl, apiKey, '/api/auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ username: login, password }),
  });
}

export function fetchAdminRealtime(baseUrl: string, apiKey: string): Promise<AdminRealtimeSnapshot> {
  return adminApiRequest<AdminRealtimeSnapshot>(baseUrl, apiKey, '/api/admin_realtime.php?limit=200');
}

export function fetchConductorRealtime(baseUrl: string, apiKey: string): Promise<ConductorRealtimeSnapshot> {
  return adminApiRequest<ConductorRealtimeSnapshot>(baseUrl, apiKey, '/api/admin_conductor_realtime.php?limit=200');
}

export function logoutAdmin(baseUrl: string, apiKey: string): Promise<{ loggedOut: boolean }> {
  return adminApiRequest<{ loggedOut: boolean }>(baseUrl, apiKey, '/api/auth.php?action=logout', { method: 'POST' });
}

export function changePasswordAdmin(
  baseUrl: string,
  apiKey: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ passwordChanged: boolean }> {
  return adminApiRequest<{ passwordChanged: boolean }>(baseUrl, apiKey, '/api/auth.php?action=change_password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function fetchBackendUsers(baseUrl: string, apiKey: string): Promise<AdminApiUser[]> {
  return adminApiRequest<AdminApiUser[]>(baseUrl, apiKey, '/api/users.php');
}

export function createBackendUserApi(
  baseUrl: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<AdminApiUser> {
  return adminApiRequest<AdminApiUser>(baseUrl, apiKey, '/api/users.php', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateBackendUserApi(
  baseUrl: string,
  apiKey: string,
  userId: string,
  body: Record<string, unknown>,
): Promise<AdminApiUser> {
  return adminApiRequest<AdminApiUser>(baseUrl, apiKey, `/api/users.php?id=${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteBackendUserApi(baseUrl: string, apiKey: string, userId: string): Promise<{ deleted: boolean }> {
  return adminApiRequest<{ deleted: boolean }>(baseUrl, apiKey, `/api/users.php?id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

export function updateAdminResource(
  baseUrl: string,
  apiKey: string,
  resource: string,
  id: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, `/api/${resource}.php?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function fetchAdminResourceList(baseUrl: string, apiKey: string, resource: string): Promise<Record<string, unknown>[]> {
  return adminApiRequest<Record<string, unknown>[]>(baseUrl, apiKey, `/api/${resource}.php`);
}

export function createAdminResource(
  baseUrl: string,
  apiKey: string,
  resource: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, `/api/${resource}.php`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteAdminResource(
  baseUrl: string,
  apiKey: string,
  resource: string,
  id: string,
): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, `/api/${resource}.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function fetchSystemConfig(baseUrl: string, apiKey: string): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/system_config.php');
}

export function updateSystemConfig(baseUrl: string, apiKey: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/system_config.php', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function fetchBrandingMediaApi(baseUrl: string, apiKey: string): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/branding_media.php');
}

export function updateBrandingMediaApi(baseUrl: string, apiKey: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/branding_media.php', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function fetchApiInterconnectionConfig(baseUrl: string, apiKey: string): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/api_config.php');
}

export function updateApiInterconnectionConfig(baseUrl: string, apiKey: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/api_config.php', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function fetchContactSocialConfig(baseUrl: string, apiKey: string): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/contact_social.php');
}

export function updateContactSocialConfig(baseUrl: string, apiKey: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/contact_social.php', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function fetchStateRates(baseUrl: string, apiKey: string): Promise<Record<string, unknown>[]> {
  return adminApiRequest<Record<string, unknown>[]>(baseUrl, apiKey, '/api/state_rates.php');
}

export function updateStateRates(baseUrl: string, apiKey: string, rows: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  return adminApiRequest<Record<string, unknown>[]>(baseUrl, apiKey, '/api/state_rates.php', {
    method: 'PATCH',
    body: JSON.stringify(rows),
  });
}

export function fetchUniversityRates(baseUrl: string, apiKey: string): Promise<Record<string, unknown>[]> {
  return adminApiRequest<Record<string, unknown>[]>(baseUrl, apiKey, '/api/university_rates.php');
}

export function updateUniversityRates(baseUrl: string, apiKey: string, rows: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  return adminApiRequest<Record<string, unknown>[]>(baseUrl, apiKey, '/api/university_rates.php', {
    method: 'PATCH',
    body: JSON.stringify(rows),
  });
}

export function verifyAdminPayment(
  baseUrl: string,
  apiKey: string,
  paymentId: string,
  status: 'verificado' | 'rechazado',
  notes?: string,
): Promise<Record<string, unknown>> {
  return updateAdminResource(baseUrl, apiKey, 'payments', paymentId, { status, notes });
}

export function adjustAdminWallet(
  baseUrl: string,
  apiKey: string,
  driverId: string,
  amountUsd: number,
  description: string,
): Promise<Record<string, unknown>> {
  return adminApiRequest<Record<string, unknown>>(baseUrl, apiKey, '/api/admin_wallet.php', {
    method: 'POST',
    body: JSON.stringify({ driverId, amountUsd, description }),
  });
}