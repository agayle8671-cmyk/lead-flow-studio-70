import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserSettings {
  isPro: boolean;
  darkMode: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
}

interface AppContextType {
  user: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleDarkMode: () => void;
  signOut: () => void;
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
    <AppContext.Provider value={{ user, updateSettings, toggleDarkMode, signOut }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
