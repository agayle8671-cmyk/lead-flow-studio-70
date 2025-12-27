import { createContext, useContext, useState, ReactNode } from "react";

type PlanType = "free" | "pro";

interface PlanContextType {
  plan: PlanType;
  isPro: boolean;
  upgrade: () => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanType>("free");

  const upgrade = () => {
    setPlan("pro");
  };

  return (
    <PlanContext.Provider value={{ plan, isPro: plan === "pro", upgrade }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
}
