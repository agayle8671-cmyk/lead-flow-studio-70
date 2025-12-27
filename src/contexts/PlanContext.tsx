import { createContext, useContext, useState, ReactNode } from "react";

type PlanType = "solo" | "firm";

interface PlanContextType {
  plan: PlanType;
  isSolo: boolean;
  isFirm: boolean;
  clientLimit: number;
  upgradeTo: (tier: PlanType) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanType>("solo");

  const upgradeTo = (tier: PlanType) => {
    setPlan(tier);
  };

  const clientLimit = plan === "solo" ? 10 : Infinity;

  return (
    <PlanContext.Provider 
      value={{ 
        plan, 
        isSolo: plan === "solo", 
        isFirm: plan === "firm",
        clientLimit,
        upgradeTo 
      }}
    >
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
