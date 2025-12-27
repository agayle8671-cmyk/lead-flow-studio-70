import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, TrendingUp, DollarSign, Settings2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulation, SimulationParams, SimulationResult } from "@/hooks/use-simulation";
import { usePlan } from "@/contexts/PlanContext";
import UpgradeModal from "./UpgradeModal";
import SimulationChart from "./SimulationChart";

interface StrategySimulatorProps {
  currentGrade: string | null;
  currentScore: number | null;
}

export default function StrategySimulator({ 
  currentGrade, 
  currentScore, 
}: StrategySimulatorProps) {
  const { isFirm } = usePlan();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [params, setParams] = useState<SimulationParams>({
    marketingOptimization: 0,
    revenueGrowth: 0,
    operationalLean: 0,
  });

  const { simulationData, isSimulating, runSimulation, clearSimulation } = useSimulation();

  const handleLockedClick = () => {
    if (!isFirm) {
      setIsUpgradeModalOpen(true);
    }
  };

  // Debounced simulation call
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (params.marketingOptimization !== 0 || params.revenueGrowth !== 0 || params.operationalLean !== 0) {
        runSimulation(params);
      } else {
        clearSimulation();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [params, runSimulation, clearSimulation]);

  const handleReset = useCallback(() => {
    setParams({
      marketingOptimization: 0,
      revenueGrowth: 0,
      operationalLean: 0,
    });
    clearSimulation();
  }, [clearSimulation]);

  // Determine if simulation shows improvement
  const gradeOrder = ["F", "D", "C", "B", "A"];
  const currentGradeIndex = currentGrade ? gradeOrder.indexOf(currentGrade) : -1;
  const simulatedGradeIndex = simulationData ? gradeOrder.indexOf(simulationData.projectedGrade) : -1;
  const isImprovement = simulatedGradeIndex > currentGradeIndex;
  const improvementDelta = simulationData && currentScore 
    ? simulationData.projectedScore - currentScore 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="bento" className="p-6 relative overflow-hidden">
        <CardHeader className="p-0 mb-5">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span>Strategy Simulator</span>
              {simulationData && isImprovement && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  +{improvementDelta} pts → {simulationData.projectedGrade}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          {/* Locked Overlay for Solo Users */}
          {!isFirm && (
            <div 
              className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center rounded-xl"
              onClick={handleLockedClick}
            >
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl" />
              <div className="relative flex flex-col items-center gap-2 text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Click to Unlock</p>
                <p className="text-xs text-muted-foreground">Firm Scale feature</p>
              </div>
            </div>
          )}

          {/* Sliders Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${!isFirm ? 'pointer-events-none' : ''}`}>
            {/* Marketing Optimization Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  Marketing
                </label>
                <span className={`text-sm font-mono ${params.marketingOptimization > 0 ? 'text-primary' : params.marketingOptimization < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {params.marketingOptimization > 0 ? '+' : ''}{params.marketingOptimization}%
                </span>
              </div>
              <Slider
                value={[params.marketingOptimization]}
                onValueChange={([value]) => setParams(p => ({ ...p, marketingOptimization: value }))}
                min={-50}
                max={50}
                step={5}
                className="w-full"
                disabled={!isFirm}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-50%</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Revenue Growth Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  Revenue
                </label>
                <span className={`text-sm font-mono ${params.revenueGrowth > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  +{params.revenueGrowth}%
                </span>
              </div>
              <Slider
                value={[params.revenueGrowth]}
                onValueChange={([value]) => setParams(p => ({ ...p, revenueGrowth: value }))}
                min={0}
                max={100}
                step={5}
                className="w-full"
                disabled={!isFirm}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>+100%</span>
              </div>
            </div>

            {/* Operational Lean Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Operations
                </label>
                <span className={`text-sm font-mono ${params.operationalLean < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {params.operationalLean}%
                </span>
              </div>
              <Slider
                value={[params.operationalLean]}
                onValueChange={([value]) => setParams(p => ({ ...p, operationalLean: value }))}
                min={-30}
                max={0}
                step={5}
                className="w-full"
                disabled={!isFirm}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-30%</span>
                <span>0%</span>
              </div>
            </div>
          </div>

          {/* Simulation Chart */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Projected Outcomes</p>
              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </div>
              )}
            </div>
            <SimulationChart simulationData={simulationData} />
          </div>

          {/* Simulation Result Summary */}
          {simulationData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between pt-4 border-t border-border"
            >
              <div>
                <p className="text-xs text-muted-foreground">Projected Grade</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">{simulationData.projectedGrade}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Projected Score</p>
                <p className="text-2xl font-bold mt-1">{simulationData.projectedScore}%</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </motion.div>
  );
}
