// API Configuration - Points to Replit backend
export const API_BASE_URL = "https://finance-core--agayle8671.replit.app";

export function apiUrl(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}
