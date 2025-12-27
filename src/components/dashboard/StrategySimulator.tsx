import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, TrendingUp, DollarSign, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulation, SimulationParams, SimulationResult } from "@/hooks/use-simulation";

interface StrategySimulatorProps {
  currentGrade: string | null;
  currentScore: number | null;
  onSimulationChange: (data: SimulationResult | null) => void;
}

export default function StrategySimulator({ 
  currentGrade, 
  currentScore, 
  onSimulationChange 
}: StrategySimulatorProps) {
  const [params, setParams] = useState<SimulationParams>({
    marketingOptimization: 0,
    revenueGrowth: 0,
    operationalLean: 0,
  });

  const { simulationData, isSimulating, runSimulation, clearSimulation } = useSimulation();

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

  // Notify parent of simulation changes
  useEffect(() => {
    onSimulationChange(simulationData);
  }, [simulationData, onSimulationChange]);

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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="bento" className="p-5">
        <CardHeader className="p-0 mb-5">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span>Strategy Simulator</span>
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
          {/* Marketing Optimization Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                Marketing Optimization
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
                Revenue Growth
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
                Operational Lean
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
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-30%</span>
              <span>0%</span>
            </div>
          </div>

          {/* Simulation Result */}
          {simulationData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 border-t border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Projected Grade</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{simulationData.projectedGrade}</span>
                    {isImprovement && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        +{improvementDelta} pts
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Projected Score</p>
                  <p className="text-2xl font-bold mt-1">{simulationData.projectedScore}%</p>
                </div>
              </div>
              
              {isSimulating && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
