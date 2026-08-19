export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function apiUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

export async function apiRequest<T>(
  baseUrl: string,
  apiKey: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(apiUrl(baseUrl, path), {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let payload: ApiResponse<T>;
  try {
    payload = responseText ? (JSON.parse(responseText) as ApiResponse<T>) : { success: false };
  } catch {
    throw new Error(
      `La API devolvió una respuesta no válida (${response.status}). Revisa la URL y el error_log de PHP.`,
    );
  }
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || `Solicitud API fallida (${response.status})${responseText ? `: ${responseText.slice(0, 160)}` : ''}`);
  }
  return payload.data as T;
}
