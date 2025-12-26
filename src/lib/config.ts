// API Configuration - Points to Replit backend
export const API_BASE_URL = "https://4c2918a7-f869-42f0-b654-23db3bfab25d-00-6l8spb3ufyqa.spock.replit.dev";

export function apiUrl(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}
