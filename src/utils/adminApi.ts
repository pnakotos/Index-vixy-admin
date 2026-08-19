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