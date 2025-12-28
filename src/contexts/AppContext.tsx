import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DriftAnomaly {
  id: string;
  date: string;
  type: "burn" | "runway" | "revenue";
  actualValue: number;
  predictedValue: number;
  driftPercentage: number;
  snapshotDate: string;
  message: string;
}

interface UserSettings {
  isPro: boolean;
  darkMode: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
}

interface WeeklyBriefState {
  anomalies: DriftAnomaly[];
  lastUpdated: string | null;
}

interface AppContextType {
  user: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleDarkMode: () => void;
  signOut: () => void;
  weeklyBrief: WeeklyBriefState;
  addDriftAnomaly: (anomaly: DriftAnomaly) => void;
  clearWeeklyBrief: () => void;
}

const defaultSettings: UserSettings = {
  isPro: true, // All users are Pro/Admin by default
  darkMode: true,
  pushNotifications: false,
  weeklyReports: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSettings>(() => {
    const stored = localStorage.getItem("runwayDNA_settings");
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [weeklyBrief, setWeeklyBrief] = useState<WeeklyBriefState>(() => {
    const stored = localStorage.getItem("runwayDNA_weeklyBrief");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { anomalies: [], lastUpdated: null };
      }
    }
    return { anomalies: [], lastUpdated: null };
  });

  // Persist weekly brief to localStorage
  useEffect(() => {
    localStorage.setItem("runwayDNA_weeklyBrief", JSON.stringify(weeklyBrief));
  }, [weeklyBrief]);

  const addDriftAnomaly = (anomaly: DriftAnomaly) => {
    setWeeklyBrief((prev) => ({
      anomalies: [anomaly, ...prev.anomalies].slice(0, 20), // Keep last 20 anomalies
      lastUpdated: new Date().toISOString(),
    }));
  };

  const clearWeeklyBrief = () => {
    setWeeklyBrief({ anomalies: [], lastUpdated: null });
  };

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem("runwayDNA_settings", JSON.stringify(user));
  }, [user]);

  // Apply dark mode to document
  useEffect(() => {
    if (user.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [user.darkMode]);

  const updateSettings = (settings: Partial<UserSettings>) => {
    setUser((prev) => ({ ...prev, ...settings }));
  };

  const toggleDarkMode = () => {
    setUser((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const signOut = () => {
    // Clear all app-related localStorage
    localStorage.removeItem("runwayDNA_settings");
    localStorage.removeItem("runwayDNA_archive");
    localStorage.removeItem("runwayDNA_session");
    
    // Reset to default settings
    setUser(defaultSettings);
    
    // Optionally redirect to home
    window.location.href = "/";
  };

  return (
    <AppContext.Provider value={{ user, updateSettings, toggleDarkMode, signOut, weeklyBrief, addDriftAnomaly, clearWeeklyBrief }}>
      {children}
    </AppContext.Provider>
  );
}

export type { DriftAnomaly };

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
