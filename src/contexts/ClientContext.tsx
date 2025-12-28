import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiUrl } from "@/lib/config";

export interface Client {
  id: number;
  name: string;
  industry: string;
  grade: "A" | "B" | "C" | "F" | null;
  score: number | null;
  lastAuditDate: string | null;
}

interface ClientContextType {
  clients: Client[];
  activeClient: Client | null;
  setActiveClient: (client: Client | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshClients: () => Promise<void>;
  uploadedCIDs: string[];
  addUploadedCID: (cid: string) => void;
  filteredClients: Client[];
  filterByUploadedCIDs: boolean;
  setFilterByUploadedCIDs: (filter: boolean) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCIDs, setUploadedCIDs] = useState<string[]>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem("uploadedCIDs");
    return stored ? JSON.parse(stored) : [];
  });
  const [filterByUploadedCIDs, setFilterByUploadedCIDs] = useState(false);

  const addUploadedCID = (cid: string) => {
    setUploadedCIDs(prev => {
      if (prev.includes(cid)) return prev;
      const updated = [...prev, cid];
      localStorage.setItem("uploadedCIDs", JSON.stringify(updated));
      return updated;
    });
  };

  // Filter clients based on uploaded CIDs when filter is active
  const filteredClients = filterByUploadedCIDs && uploadedCIDs.length > 0
    ? clients.filter(c => uploadedCIDs.includes(c.id.toString()))
    : clients;

  const refreshClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl("/api/portfolio"), {
        method: "GET",
        headers: { Accept: "application/json" },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }

      const data = await response.json();
      const clientList: Client[] = (data.clients || []).map((c: any) => ({
        id: Number(c.id ?? c.clientId),
        name: c.name || c.clientName || `Client ${c.id ?? c.clientId}`,
        industry: c.industry || "General",
        grade: (c.healthGrade ?? c.grade ?? null) as any,
        score: (c.performanceScore ?? c.score ?? null) as any,
        lastAuditDate: c.latestReportDate ?? c.lastAuditDate ?? c.reportDate ?? null,
      }));
      setClients(clientList);
    } catch (err) {
      console.error("Portfolio fetch error:", err);
      setError("Unable to load client portfolio");
      // Fallback demo data for development
      setClients([
        { id: 1, name: "Acme Industries", industry: "Manufacturing", grade: "A", score: 92, lastAuditDate: "2025-12-20" },
        { id: 2, name: "TechStart Inc", industry: "Technology", grade: "B", score: 78, lastAuditDate: "2025-12-18" },
        { id: 3, name: "RetailMax LLC", industry: "Retail", grade: "C", score: 58, lastAuditDate: "2025-12-15" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshClients();
  }, []);

  return (
    <ClientContext.Provider value={{ 
      clients, 
      activeClient, 
      setActiveClient, 
      isLoading, 
      error, 
      refreshClients,
      uploadedCIDs,
      addUploadedCID,
      filteredClients,
      filterByUploadedCIDs,
      setFilterByUploadedCIDs
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient(): ClientContextType {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
}
