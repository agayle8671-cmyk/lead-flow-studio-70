// API Configuration - Points to production backend
export const API_BASE_URL = "https://marginauditpro.com";

export function apiUrl(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}
