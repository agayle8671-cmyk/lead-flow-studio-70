// API Configuration - Points to Replit backend
export const API_BASE_URL = "PASTE_YOUR_REPLIT_URL_HERE";

export function apiUrl(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}
