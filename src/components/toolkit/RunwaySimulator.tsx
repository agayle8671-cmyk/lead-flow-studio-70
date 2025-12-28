import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Rocket, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Target,
  Calendar,
  DollarSign,
  Gauge
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface RunwaySimulatorProps {
  initialData?: {
    monthly_burn?: number;
    cash_on_hand?: number;
    runway_months?: number;
  };
  onClose: () => void;
}

export const RunwaySimulator = ({ initialData, onClose }: RunwaySimulatorProps) => {
  const [inputs, setInputs] = useState({
    cashOnHand: initialData?.cash_on_hand || 500000,
    monthlyBurn: initialData?.monthly_burn || 35000,
    burnChange: 0,
    revenueGrowth: 0,
  });

  const [animatedMonths, setAnimatedMonths] = useState(0);

  const adjustedBurn = inputs.monthlyBurn * (1 + inputs.burnChange / 100);
  const runwayMonths = adjustedBurn > 0 ? Math.min(inputs.cashOnHand / adjustedBurn, 60) : 60;

  // Generate projection data
  const projectionData = useMemo(() => {
    const data = [];
    let cash = inputs.cashOnHand;
    let burn = inputs.monthlyBurn * (1 + inputs.burnChange / 100);
    
    for (let month = 0; month <= Math.min(runwayMonths + 6, 36); month++) {
      data.push({
        month,
        label: `M${month}`,
        cash: Math.max(0, cash),
        burn: burn,
        danger: cash < inputs.monthlyBurn * 3,
        warning: cash < inputs.monthlyBurn * 6 && cash >= inputs.monthlyBurn * 3,
      });
      cash -= burn;
      // Gradually reduce burn if revenue growth is set
      burn *= (1 - inputs.revenueGrowth / 100 / 12);
    }
    return data;
  }, [inputs]);

  // Animate months counter
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const stepSize = (runwayMonths - animatedMonths) / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimatedMonths(prev => prev + stepSize);
      if (step >= steps) {
        clearInterval(interval);
        setAnimatedMonths(runwayMonths);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [runwayMonths]);

  const getRunwayStatus = () => {
    if (runwayMonths >= 18) return { color: "hsl(152, 100%, 50%)", label: "Healthy", icon: Sparkles };
    if (runwayMonths >= 12) return { color: "hsl(152, 70%, 45%)", label: "Good", icon: TrendingUp };
    if (runwayMonths >= 6) return { color: "hsl(45, 90%, 55%)", label: "Caution", icon: AlertTriangle };
    return { color: "hsl(0, 70%, 55%)", label: "Critical", icon: AlertTriangle };
  };

  const status = getRunwayStatus();
  const StatusIcon = status.icon;

  // Calculate key dates
  const today = new Date();
  const runwayEndDate = new Date(today);
  runwayEndDate.setMonth(runwayEndDate.getMonth() + Math.floor(runwayMonths));

  const scenarios = [
    { 
      label: "Cut 20%", 
      change: -20, 
      months: inputs.monthlyBurn > 0 ? inputs.cashOnHand / (inputs.monthlyBurn * 0.8) : 0 
    },
    { 
      label: "Current", 
      change: 0, 
      months: runwayMonths 
    },
    { 
      label: "Add 20%", 
      change: 20, 
      months: inputs.monthlyBurn > 0 ? inputs.cashOnHand / (inputs.monthlyBurn * 1.2) : 0 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-[hsl(152,100%,50%)/0.2] shadow-2xl shadow-[hsl(152,100%,50%)/0.1]"
      >
        {/* Header */}
        <div className="relative p-8 pb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(152,100%,50%)/0.1] via-transparent to-[hsl(180,80%,45%)/0.1]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[hsl(152,100%,50%)/0.15] blur-[100px] rounded-full" />
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(152,100%,50%)] to-[hsl(180,80%,45%)] flex items-center justify-center shadow-lg shadow-[hsl(152,100%,50%)/0.3]">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Runway Simulator</h2>
              <p className="text-[hsl(220,10%,55%)]">Visualize your financial trajectory</p>
            </div>
          </motion.div>
        </div>

        {/* Main Runway Display */}
        <div className="px-8 py-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative p-8 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(152,100%,50%)/0.08] via-[hsl(180,80%,45%)/0.05] to-[hsl(226,100%,59%)/0.08]" />
            <div className="absolute inset-0 backdrop-blur-xl bg-[hsl(240,7%,8%)/0.6]" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Runway Months - Big Display */}
              <div className="text-center md:text-left">
                <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-wider mb-2">Projected Runway</p>
                <div className="flex items-baseline gap-2">
                  <motion.span 
                    className="text-8xl font-bold font-mono"
                    style={{ color: status.color }}
                  >
                    {animatedMonths.toFixed(1)}
                  </motion.span>
                  <span className="text-3xl text-[hsl(220,10%,50%)]">months</span>
                </div>
                <div className="flex items-center gap-2 mt-3" style={{ color: status.color }}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-semibold">{status.label} Runway</span>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[hsl(226,100%,59%)]" />
                    <span className="text-xs text-[hsl(220,10%,55%)]">Zero Cash Date</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {runwayMonths >= 60 ? "60+ months" : runwayEndDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                    <span className="text-xs text-[hsl(220,10%,55%)]">Monthly Burn</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    ${adjustedBurn.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Runway Progress Bar */}
            <div className="relative mt-8">
              <div className="h-4 rounded-full bg-[hsl(240,7%,15%)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((runwayMonths / 24) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${status.color}, hsl(180, 80%, 45%))` 
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[hsl(220,10%,45%)]">
                <span>Today</span>
                <span>6 mo</span>
                <span>12 mo</span>
                <span>18 mo</span>
                <span>24+ mo</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="p-8 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Cash on Hand */}
            <div className="p-5 rounded-2xl bg-[hsl(152,100%,50%)/0.08] border border-[hsl(152,100%,50%)/0.2]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(152,100%,50%)/0.2] flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                  </div>
                  <div>
                    <Label className="text-[hsl(152,100%,50%)] font-semibold">Cash on Hand</Label>
                    <p className="text-xs text-[hsl(220,10%,50%)]">Current bank balance</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">${inputs.cashOnHand.toLocaleString()}</span>
              </div>
              <Slider
                value={[inputs.cashOnHand]}
                onValueChange={([val]) => setInputs(prev => ({ ...prev, cashOnHand: val }))}
                max={2000000}
                min={10000}
                step={10000}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[hsl(240,7%,15%)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
              />
            </div>

            {/* Monthly Burn */}
            <div className="p-5 rounded-2xl bg-[hsl(0,70%,55%)/0.08] border border-[hsl(0,70%,55%)/0.2]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(0,70%,55%)/0.2] flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-[hsl(0,70%,55%)]" />
                  </div>
                  <div>
                    <Label className="text-[hsl(0,70%,55%)] font-semibold">Monthly Burn</Label>
                    <p className="text-xs text-[hsl(220,10%,50%)]">Net monthly cash outflow</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">${inputs.monthlyBurn.toLocaleString()}</span>
              </div>
              <Slider
                value={[inputs.monthlyBurn]}
                onValueChange={([val]) => setInputs(prev => ({ ...prev, monthlyBurn: val }))}
                max={200000}
                min={5000}
                step={1000}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[hsl(240,7%,15%)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
              />
            </div>

            {/* Scenario Modifier */}
            <div className="p-5 rounded-2xl bg-[hsl(226,100%,59%)/0.08] border border-[hsl(226,100%,59%)/0.2]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.2] flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                </div>
                <div>
                  <Label className="text-[hsl(226,100%,68%)] font-semibold">Burn Adjustment</Label>
                  <p className="text-xs text-[hsl(220,10%,50%)]">Model different scenarios</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[hsl(152,100%,50%)]">-50%</span>
                <Slider
                  value={[inputs.burnChange]}
                  onValueChange={([val]) => setInputs(prev => ({ ...prev, burnChange: val }))}
                  max={50}
                  min={-50}
                  step={5}
                  className="flex-1 [&>span:first-child]:h-2 [&>span:first-child]:bg-[hsl(240,7%,15%)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                />
                <span className="text-sm text-[hsl(0,70%,55%)]">+50%</span>
              </div>
              <p className="text-center mt-2 text-sm font-medium" style={{ color: inputs.burnChange < 0 ? "hsl(152, 100%, 50%)" : inputs.burnChange > 0 ? "hsl(0, 70%, 55%)" : "hsl(220, 10%, 60%)" }}>
                {inputs.burnChange === 0 ? "Current burn rate" : inputs.burnChange < 0 ? `${Math.abs(inputs.burnChange)}% reduction` : `${inputs.burnChange}% increase`}
              </p>
            </div>

            {/* Scenario Comparison */}
            <div className="p-4 rounded-xl bg-[hsl(240,7%,10%)] border border-white/5">
              <h4 className="text-sm font-medium text-[hsl(220,10%,60%)] mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Quick Scenarios
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {scenarios.map((scenario) => (
                  <motion.button
                    key={scenario.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputs(prev => ({ ...prev, burnChange: scenario.change }))}
                    className={`p-3 rounded-xl text-center transition-all ${
                      inputs.burnChange === scenario.change 
                        ? "bg-[hsl(226,100%,59%)/0.2] border border-[hsl(226,100%,59%)/0.4]" 
                        : "bg-[hsl(240,7%,12%)] border border-transparent hover:border-white/10"
                    }`}
                  >
                    <p className="text-xs text-[hsl(220,10%,55%)]">{scenario.label}</p>
                    <p className="text-lg font-bold text-white">{scenario.months.toFixed(1)}mo</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Chart */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Cash Projection Chart */}
            <div className="p-6 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5">
              <h4 className="text-lg font-semibold text-white mb-4">Cash Projection</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0.4} />
                        <stop offset="50%" stopColor="hsl(45, 90%, 55%)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: "hsl(220,10%,45%)", fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: "hsl(220,10%,45%)", fontSize: 11 }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <ReferenceLine y={inputs.monthlyBurn * 3} stroke="hsl(0, 70%, 55%)" strokeDasharray="5 5" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(240,7%,12%)",
                        border: "1px solid hsl(152,100%,50%,0.3)",
                        borderRadius: "12px",
                        color: "white"
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Cash"]}
                      labelFormatter={(label) => `Month ${label.replace("M", "")}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="cash"
                      stroke="hsl(152, 100%, 50%)"
                      strokeWidth={3}
                      fill="url(#cashGradient)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-[hsl(220,10%,50%)]">
                <div className="w-4 border-t-2 border-dashed border-[hsl(0,70%,55%)]" />
                <span>3-month cash reserve (danger zone)</span>
              </div>
            </div>

            {/* Runway Insights */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-5 rounded-xl bg-gradient-to-r from-[hsl(152,100%,50%)/0.1] to-transparent border border-[hsl(152,100%,50%)/0.2]"
            >
              <h4 className="text-sm font-medium text-[hsl(152,100%,50%)] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Runway Insights
              </h4>
              <ul className="space-y-2 text-sm text-[hsl(220,10%,65%)]">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(152,100%,50%)]">•</span>
                  {runwayMonths >= 18 
                    ? "You have a healthy runway. Focus on growth."
                    : runwayMonths >= 12 
                    ? "Consider starting fundraising discussions in the next 3-6 months."
                    : runwayMonths >= 6 
                    ? "Runway is short. Prioritize extending runway or closing funding."
                    : "Critical runway. Take immediate action to reduce burn or secure emergency funding."
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(226,100%,59%)]">•</span>
                  {inputs.burnChange < 0 
                    ? `A ${Math.abs(inputs.burnChange)}% burn reduction adds ${(runwayMonths - (inputs.cashOnHand / inputs.monthlyBurn)).toFixed(1)} months to your runway.`
                    : inputs.burnChange > 0
                    ? `${inputs.burnChange}% burn increase reduces runway by ${((inputs.cashOnHand / inputs.monthlyBurn) - runwayMonths).toFixed(1)} months.`
                    : "Adjust the burn modifier to explore different scenarios."
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(45,90%,55%)]">•</span>
                  Target 18+ months runway before your next fundraise.
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
