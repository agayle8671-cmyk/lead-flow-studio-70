import { useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";

export interface SimulationParams {
  marketingOptimization: number; // -50 to +50
  revenueGrowth: number; // 0 to +100
  operationalLean: number; // -30 to 0
}

export interface SimulationResult {
  projectedRevenue: number[];
  projectedProfit: number[];
  projectedGrade: string;
  projectedScore: number;
  months: string[];
}

interface UseSimulationReturn {
  simulationData: SimulationResult | null;
  isSimulating: boolean;
  error: string | null;
  runSimulation: (params: SimulationParams) => Promise<void>;
  clearSimulation: () => void;
}

export function useSimulation(): UseSimulationReturn {
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(async (params: SimulationParams) => {
    setIsSimulating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketing_optimization: params.marketingOptimization,
          revenue_growth: params.revenueGrowth,
          operational_lean: params.operationalLean,
        }),
      });

      if (!response.ok) {
        throw new Error("Simulation failed");
      }

      const data = await response.json();
      
      setSimulationData({
        projectedRevenue: data.projected_revenue ?? data.projectedRevenue ?? [],
        projectedProfit: data.projected_profit ?? data.projectedProfit ?? [],
        projectedGrade: data.projected_grade ?? data.projectedGrade ?? "C",
        projectedScore: data.projected_score ?? data.projectedScore ?? 50,
        months: data.months ?? ["Month 1", "Month 2", "Month 3"],
      });
    } catch (err) {
      console.warn("Simulation API unavailable, using fallback:", err);
      
      // Fallback simulation logic
      const baseRevenue = 50000;
      const baseProfit = 15000;
      
      const revenueMultiplier = 1 + (params.revenueGrowth / 100);
      const costSavings = 1 + (params.operationalLean / 100); // negative = savings
      const marketingImpact = 1 + (params.marketingOptimization / 200); // marketing has smaller impact
      
      const projectedRevenue = [1, 2, 3].map((month) => {
        return Math.round(baseRevenue * revenueMultiplier * Math.pow(1.02, month) * marketingImpact);
      });
      
      const projectedProfit = [1, 2, 3].map((month, i) => {
        const costs = (baseRevenue - baseProfit) * costSavings;
        return Math.round(projectedRevenue[i] - costs);
      });
      
      // Calculate projected grade based on profit margin
      const avgProfitMargin = projectedProfit.reduce((a, b) => a + b, 0) / projectedRevenue.reduce((a, b) => a + b, 0);
      let projectedGrade = "C";
      let projectedScore = 50;
      
      if (avgProfitMargin > 0.35) {
        projectedGrade = "A";
        projectedScore = 90;
      } else if (avgProfitMargin > 0.25) {
        projectedGrade = "B";
        projectedScore = 75;
      } else if (avgProfitMargin > 0.15) {
        projectedGrade = "C";
        projectedScore = 55;
      } else if (avgProfitMargin > 0) {
        projectedGrade = "D";
        projectedScore = 35;
      } else {
        projectedGrade = "F";
        projectedScore = 15;
      }
      
      setSimulationData({
        projectedRevenue,
        projectedProfit,
        projectedGrade,
        projectedScore,
        months: ["Month 1", "Month 2", "Month 3"],
      });
    } finally {
      setIsSimulating(false);
    }
  }, []);

  const clearSimulation = useCallback(() => {
    setSimulationData(null);
    setError(null);
  }, []);

  return {
    simulationData,
    isSimulating,
    error,
    runSimulation,
    clearSimulation,
  };
}
