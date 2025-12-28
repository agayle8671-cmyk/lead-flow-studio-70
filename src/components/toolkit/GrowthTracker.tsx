import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap,
  Sparkles,
  Rocket,
  BarChart3,
  LineChart,
  Gauge,
  Award,
  Activity,
  TrendingDown,
  Percent,
  Brain,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  CheckCircle2,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  ComposedChart,
  Bar,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface AIInsights {
  healthScore: number;
  healthLabel: string;
  primaryInsight: string;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}

interface GrowthTrackerProps {
  onClose: () => void;
}

interface MonthlyData {
  month: string;
  mrr: number;
  customers: number;
  arr: number;
  growth: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GrowthTracker({ onClose }: GrowthTrackerProps) {
  const [currentMRR, setCurrentMRR] = useState(15000);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(12);
  const [avgRevenuePerUser, setAvgRevenuePerUser] = useState(99);
  const [churnRate, setChurnRate] = useState(3);
  const [animatedMRR, setAnimatedMRR] = useState(currentMRR);
  const [projectionData, setProjectionData] = useState<MonthlyData[]>([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  
  // New features: LTV:CAC and Revenue Goal
  const [customerAcquisitionCost, setCustomerAcquisitionCost] = useState(150);
  const [revenueGoal, setRevenueGoal] = useState(50000);

  // Calculate projections whenever inputs change
  useEffect(() => {
    const data: MonthlyData[] = [];
    let mrr = currentMRR;
    let customers = avgRevenuePerUser > 0 ? Math.round(currentMRR / avgRevenuePerUser) : 0;
    
    const currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const prevMRR = i === 0 ? mrr : data[i - 1].mrr;
      
      // Apply growth and churn
      const growthMultiplier = 1 + (monthlyGrowthRate / 100);
      const churnMultiplier = 1 - (churnRate / 100);
      mrr = mrr * growthMultiplier * churnMultiplier;
      customers = avgRevenuePerUser > 0 ? Math.round(mrr / avgRevenuePerUser) : 0;
      
      const monthGrowth = prevMRR > 0 ? ((mrr - prevMRR) / prevMRR) * 100 : 0;
      
      data.push({
        month: MONTHS[monthIndex],
        mrr: Math.round(mrr),
        customers: customers,
        arr: Math.round(mrr * 12),
        growth: monthGrowth
      });
    }
    
    setProjectionData(data);
  }, [currentMRR, monthlyGrowthRate, avgRevenuePerUser, churnRate]);

  // Animate MRR counter
  useEffect(() => {
    const targetMRR = currentMRR;
    const duration = 800;
    const steps = 30;
    const stepSize = (targetMRR - animatedMRR) / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimatedMRR(prev => prev + stepSize);
      if (step >= steps) {
        clearInterval(interval);
        setAnimatedMRR(targetMRR);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [currentMRR]);

  const projectedARR = projectionData.length > 0 ? projectionData[projectionData.length - 1].arr : 0;
  const currentARR = currentMRR * 12;
  const arrGrowth = currentARR > 0 ? ((projectedARR - currentARR) / currentARR) * 100 : 0;
  const netGrowthRate = monthlyGrowthRate - churnRate;
  const projectedCustomers = projectionData.length > 0 ? projectionData[projectionData.length - 1].customers : 0;
  const currentCustomers = avgRevenuePerUser > 0 ? Math.round(currentMRR / avgRevenuePerUser) : 0;
  const customerGrowth = currentCustomers > 0 ? ((projectedCustomers - currentCustomers) / currentCustomers) * 100 : 0;
  
  // LTV:CAC Calculations
  const avgLifetimeMonths = churnRate > 0 ? 1 / (churnRate / 100) : 0;
  const lifetimeValue = avgRevenuePerUser * avgLifetimeMonths;
  const ltvCacRatio = customerAcquisitionCost > 0 ? lifetimeValue / customerAcquisitionCost : 0;
  
  // Revenue Goal Calculations
  const monthsToGoal = useMemo(() => {
    if (revenueGoal <= currentMRR) return 0;
    let mrr = currentMRR;
    const growthMultiplier = 1 + (monthlyGrowthRate / 100);
    const churnMultiplier = 1 - (churnRate / 100);
    let months = 0;
    while (mrr < revenueGoal && months < 60) {
      mrr = mrr * growthMultiplier * churnMultiplier;
      months++;
    }
    return months <= 60 ? months : -1; // -1 means goal not reachable in 5 years
  }, [currentMRR, revenueGoal, monthlyGrowthRate, churnRate]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Custom tooltip for MRR chart
  const MRRTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="p-4 rounded-xl bg-[hsl(240,7%,10%)] border border-white/10 shadow-xl min-w-[200px]">
        <p className="text-white font-semibold mb-3">{label}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">MRR:</span>
            <span className="text-[hsl(270,60%,65%)] font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
              {formatCurrency(data.mrr)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">ARR:</span>
            <span className="text-[hsl(142,69%,50%)] font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
              {formatCurrency(data.arr)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">Customers:</span>
            <span className="text-white font-semibold">{data.customers}</span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-white/10">
            <span className="text-[hsl(220,10%,55%)]">MoM Growth:</span>
            <span className={`font-bold ${data.growth >= 0 ? "text-[hsl(142,69%,50%)]" : "text-[hsl(0,70%,55%)]"}`}>
              {data.growth >= 0 ? "+" : ""}{data.growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Growth milestones
  const milestones = useMemo(() => {
    const milestones = [];
    if (projectedARR >= 1000000) milestones.push({ label: "$1M ARR", reached: projectedARR >= 1000000, value: 1000000 });
    if (projectedARR >= 5000000) milestones.push({ label: "$5M ARR", reached: projectedARR >= 5000000, value: 5000000 });
    if (projectedARR >= 10000000) milestones.push({ label: "$10M ARR", reached: projectedARR >= 10000000, value: 10000000 });
    return milestones;
  }, [projectedARR]);

  // Fetch AI Insights
  const fetchAIInsights = useCallback(async () => {
    if (!supabase) {
      setInsightsError('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.');
      setIsLoadingInsights(false);
      return;
    }
    
    setIsLoadingInsights(true);
    setInsightsError(null);
    
    try {
      const response = await supabase.functions.invoke('growth-insights', {
        body: {
          currentMRR,
          monthlyGrowthRate,
          avgRevenuePerUser,
          churnRate,
          customerAcquisitionCost,
          projectedARR,
          ltvCacRatio,
          customers: currentCustomers
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch insights');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setAiInsights(response.data as AIInsights);
      toast.success("AI insights generated!");
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      const message = error instanceof Error ? error.message : 'Failed to generate insights';
      setInsightsError(message);
      toast.error(message);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [currentMRR, monthlyGrowthRate, avgRevenuePerUser, churnRate, customerAcquisitionCost, projectedARR, ltvCacRatio, currentCustomers]);

  // Health score color helper
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'hsl(152, 100%, 50%)';
    if (score >= 60) return 'hsl(50, 100%, 50%)';
    if (score >= 40) return 'hsl(30, 100%, 50%)';
    return 'hsl(0, 70%, 55%)';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto card-surface rounded-2xl"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[hsl(0,0%,100%,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(211,100%,45%)] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Growth Tracker
              </h2>
              <p className="text-sm text-[hsl(0,0%,53%)]">
                MRR & ARR projections with growth modeling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchAIInsights}
              disabled={isLoadingInsights}
              variant="secondary"
            >
              {isLoadingInsights ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isLoadingInsights ? "Analyzing..." : aiInsights ? "Refresh" : "AI Insights"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CONTENT - Tight 2-column layout
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ═══ LEFT PANEL: CONTROLS ═══ */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Revenue Metrics Card */}
              <div className="card-surface p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(211,100%,45%)/0.2] flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[hsl(270,60%,65%)]" />
                  </div>
                  <h3 className="text-white font-semibold">Revenue Metrics</h3>
                </div>
                
                <div className="space-y-5">
                  {/* Current MRR */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                        Current MRR
                      </Label>
                      <span className="text-xs text-[hsl(220,10%,45%)]">Monthly</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] text-sm">$</span>
                      <Input
                        type="number"
                        value={currentMRR}
                        onChange={(e) => setCurrentMRR(Math.max(0, Number(e.target.value)))}
                        className="pl-8 h-11  text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Monthly Growth Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                        Monthly Growth Rate
                      </Label>
                      <Input
                        type="number"
                        value={monthlyGrowthRate}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setMonthlyGrowthRate(val);
                        }}
                        className="h-6 w-16 text-xs  text-white font-mono text-center focus:border-[hsl(142,69%,50%)]/50"
                        min={0}
                        step={0.5}
                      />
                    </div>
                    <Slider
                      value={[Math.min(monthlyGrowthRate, 50)]}
                      onValueChange={(value) => setMonthlyGrowthRate(value[0])}
                      min={0}
                      max={50}
                      step={0.5}
                      className="mb-2 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-[hsl(240,7%,20%)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                    <div className="flex justify-between text-[10px] text-[hsl(220,10%,45%)]">
                      <span>0%</span>
                      <span>25%</span>
                      <span className="flex items-center gap-1">
                        50%
                        {monthlyGrowthRate > 50 && <span className="text-[hsl(142,69%,50%)]">+</span>}
                      </span>
                    </div>
                  </div>

                  {/* ARPU */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                        Avg Revenue Per User
                      </Label>
                      <span className="text-xs text-[hsl(220,10%,45%)]">ARPU</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] text-sm">$</span>
                      <Input
                        type="number"
                        value={avgRevenuePerUser}
                        onChange={(e) => setAvgRevenuePerUser(Math.max(0, Number(e.target.value)))}
                        className="pl-8 h-11  text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Churn Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                        Monthly Churn Rate
                      </Label>
                      <Input
                        type="number"
                        value={churnRate}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setChurnRate(val);
                        }}
                        className="h-6 w-16 text-xs  text-white font-mono text-center focus:border-[hsl(0,70%,55%)]/50"
                        min={0}
                        step={0.1}
                      />
                    </div>
                    <Slider
                      value={[Math.min(churnRate, 20)]}
                      onValueChange={(value) => setChurnRate(value[0])}
                      min={0}
                      max={20}
                      step={0.1}
                      className="mb-2 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-[hsl(240,7%,20%)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                    <div className="flex justify-between text-[10px] text-[hsl(220,10%,45%)]">
                      <span>0%</span>
                      <span>10%</span>
                      <span className="flex items-center gap-1">
                        20%
                        {churnRate > 20 && <span className="text-[hsl(0,70%,55%)]">+</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Quality Indicator */}
              <div className={`p-5 rounded-2xl border ${
                netGrowthRate >= 15 
                  ? 'card-surface border-[hsl(142,69%,50%,0.3)]'
                  : netGrowthRate >= 10
                    ? 'card-surface border-[hsl(142,69%,50%,0.2)]'
                    : netGrowthRate >= 5
                      ? 'card-surface border-[hsl(35,100%,52%,0.3)]'
                      : 'card-surface border-[hsl(0,100%,62%,0.3)]'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {netGrowthRate >= 15 ? (
                    <Award className="w-5 h-5 text-[hsl(142,69%,50%)]" />
                  ) : netGrowthRate >= 10 ? (
                    <Target className="w-5 h-5 text-[hsl(152,70%,45%)]" />
                  ) : netGrowthRate >= 5 ? (
                    <TrendingUp className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-[hsl(0,70%,55%)]" />
                  )}
                  <span className={`text-sm font-semibold ${
                    netGrowthRate >= 15 ? "text-[hsl(142,69%,50%)]" : netGrowthRate >= 10 ? "text-[hsl(152,70%,45%)]" : netGrowthRate >= 5 ? "text-[hsl(45,90%,55%)]" : "text-[hsl(0,70%,55%)]"
                  }`}>
                    {netGrowthRate >= 15 ? "Elite Growth" : netGrowthRate >= 10 ? "Strong Growth" : netGrowthRate >= 5 ? "Moderate Growth" : "Low Growth"}
                  </span>
                </div>
                <p className="text-xs text-[hsl(220,10%,55%)]">
                  {netGrowthRate >= 15 
                    ? "Top-tier growth rate. You're in the top 5% of SaaS companies."
                    : netGrowthRate >= 10
                      ? "Strong growth trajectory. Above industry average."
                      : netGrowthRate >= 5
                        ? "Positive growth. Consider optimizing acquisition channels."
                        : "Growth needs attention. Review churn and acquisition strategies."
                  }
                </p>
              </div>
            </motion.div>

            {/* ═══ RIGHT PANEL: VISUALIZATIONS ═══ */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* MRR Projection Chart */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(211,100%,45%)/0.2] flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-[hsl(270,60%,65%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">12-Month MRR Projection</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Compound growth with churn modeling</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(211,100%,45%)/0.1] border border-[hsl(211,100%,45%)/0.3]">
                    <Sparkles className="w-3 h-3 text-[hsl(270,60%,65%)]" />
                    <span className="text-xs text-[hsl(270,60%,65%)] font-semibold">Interactive</span>
                  </div>
                </div>
                
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="arrGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 15%)" opacity={0.5} />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "hsl(220,10%,55%)", fontSize: 11 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "hsl(220,10%,55%)", fontSize: 11 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip content={<MRRTooltip />} />
                      {/* MRR Area */}
                      <Area
                        type="monotone"
                        dataKey="mrr"
                        stroke="hsl(270, 60%, 55%)"
                        strokeWidth={3}
                        fill="url(#mrrGradient)"
                      />
                      {/* ARR Line (dashed) */}
                      <Line
                        type="monotone"
                        dataKey="arr"
                        stroke="hsl(152, 100%, 50%)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Secondary Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Customer Count */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[hsl(211,100%,45%)/0.1] to-transparent border border-[hsl(211,100%,45%)/0.3]">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[hsl(226,100%,68%)]" />
                    <span className="text-xs uppercase tracking-wider text-[hsl(226,100%,68%)]">Customers</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{currentCustomers}</p>
                  <p className="text-xs text-[hsl(220,10%,50%)]">Today</p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-lg font-bold text-[hsl(226,100%,68%)]">{projectedCustomers}</p>
                    <p className="text-xs text-[hsl(220,10%,50%)]">12 months</p>
                  </div>
                </div>

                {/* ARPU */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[hsl(45,90%,55%)/0.1] to-transparent border border-[hsl(45,90%,55%)/0.3]">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                    <span className="text-xs uppercase tracking-wider text-[hsl(45,90%,55%)]">ARPU</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono' }}>
                    ${avgRevenuePerUser}
                  </p>
                  <p className="text-xs text-[hsl(220,10%,50%)]">Per user/month</p>
                </div>

                {/* Customer Growth */}
                <div className={`p-5 rounded-2xl border ${
                  customerGrowth >= 50
                    ? 'bg-gradient-to-br from-[hsl(142,69%,50%)/0.1] to-transparent border-[hsl(142,69%,50%)/0.3]'
                    : customerGrowth >= 25
                      ? 'bg-gradient-to-br from-[hsl(45,90%,55%)/0.1] to-transparent border-[hsl(45,90%,55%)/0.3]'
                      : 'bg-gradient-to-br from-[hsl(0,70%,55%)/0.1] to-transparent border-[hsl(0,70%,55%)/0.3]'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4" style={{ color: customerGrowth >= 50 ? "hsl(142,69%,50%)" : customerGrowth >= 25 ? "hsl(45,90%,55%)" : "hsl(0,70%,55%)" }} />
                    <span className={`text-xs uppercase tracking-wider ${
                      customerGrowth >= 50 ? "text-[hsl(142,69%,50%)]" : customerGrowth >= 25 ? "text-[hsl(45,90%,55%)]" : "text-[hsl(0,70%,55%)]"
                    }`}>
                      Growth
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 ${customerGrowth >= 50 ? 'text-[hsl(142,69%,50%)]' : customerGrowth >= 25 ? 'text-[hsl(45,90%,55%)]' : 'text-[hsl(0,70%,55%)]'}`}>
                    {customerGrowth >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                      {Math.abs(customerGrowth).toFixed(0)}%
                    </p>
                  </div>
                  <p className="text-xs text-[hsl(220,10%,50%)] mt-1">12 months</p>
                </div>
              </div>

              {/* LTV:CAC Ratio Calculator */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(211,100%,45%)/0.2] flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-[hsl(226,100%,68%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">LTV:CAC Ratio</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Lifetime Value vs Customer Acquisition Cost</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-[hsl(220,10%,55%)] text-xs uppercase mb-2 block">Customer Acquisition Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] text-sm">$</span>
                      <Input
                        type="number"
                        value={customerAcquisitionCost}
                        onChange={(e) => setCustomerAcquisitionCost(Math.max(0, Number(e.target.value) || 0))}
                        className="pl-8 h-11  text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[hsl(220,10%,55%)] text-xs uppercase mb-2 block">Lifetime Value</Label>
                    <div className="h-11 px-4 rounded-lg bg-[hsl(240,7%,12%)] border border-white/10 flex items-center">
                      <span className="text-lg font-bold text-white font-mono">
                        {formatCurrency(lifetimeValue)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-5 rounded-xl border-2 ${
                  ltvCacRatio >= 3
                    ? 'bg-gradient-to-br from-[hsl(142,69%,50%)/0.15] to-transparent border-[hsl(142,69%,50%)/0.4]'
                    : ltvCacRatio >= 2
                      ? 'bg-gradient-to-br from-[hsl(45,90%,55%)/0.15] to-transparent border-[hsl(45,90%,55%)/0.4]'
                      : 'bg-gradient-to-br from-[hsl(0,70%,55%)/0.15] to-transparent border-[hsl(0,70%,55%)/0.4]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className={`w-6 h-6 ${
                        ltvCacRatio >= 3 ? 'text-[hsl(142,69%,50%)]' : ltvCacRatio >= 2 ? 'text-[hsl(45,90%,55%)]' : 'text-[hsl(0,70%,55%)]'
                      }`} />
                      <div>
                        <p className={`text-sm font-semibold ${
                          ltvCacRatio >= 3 ? 'text-[hsl(142,69%,50%)]' : ltvCacRatio >= 2 ? 'text-[hsl(45,90%,55%)]' : 'text-[hsl(0,70%,55%)]'
                        }`}>
                          {ltvCacRatio >= 3 ? 'Healthy Ratio' : ltvCacRatio >= 2 ? 'Moderate Ratio' : 'Poor Ratio'}
                        </p>
                        <p className="text-xs text-[hsl(220,10%,55%)]">
                          {ltvCacRatio >= 3 ? '3:1+ is ideal for SaaS' : ltvCacRatio >= 2 ? 'Aim for 3:1 or higher' : 'Needs improvement'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold font-mono ${
                        ltvCacRatio >= 3 ? 'text-[hsl(142,69%,50%)]' : ltvCacRatio >= 2 ? 'text-[hsl(45,90%,55%)]' : 'text-[hsl(0,70%,55%)]'
                      }`}>
                        {ltvCacRatio.toFixed(1)}:1
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Revenue Goal Tracker */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(211,100%,45%)/0.2] flex items-center justify-center">
                      <Target className="w-5 h-5 text-[hsl(270,60%,65%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Revenue Goal Tracker</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Set target and track progress</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label className="text-[hsl(220,10%,55%)] text-xs uppercase mb-2 block">Target MRR</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] text-sm">$</span>
                    <Input
                      type="number"
                      value={revenueGoal}
                      onChange={(e) => setRevenueGoal(Math.max(0, Number(e.target.value) || 0))}
                      className="pl-8 h-11  text-white font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(220,10%,55%)]">Current MRR</span>
                    <span className="text-lg font-bold text-white font-mono">{formatCurrency(currentMRR)}</span>
                  </div>
                  <div className="w-full h-3 bg-[hsl(240,7%,18%)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (currentMRR / revenueGoal) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        (currentMRR / revenueGoal) >= 1
                          ? 'bg-gradient-to-r from-[hsl(142,69%,50%)] to-[hsl(152,100%,60%)]'
                          : 'bg-gradient-to-r from-[hsl(211,100%,45%)] to-[hsl(290,70%,45%)]'
                      }`}
                    />
                  </div>
                  {monthsToGoal >= 0 ? (
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-sm text-[hsl(220,10%,55%)]">Estimated time to goal</span>
                      <span className="text-xl font-bold text-[hsl(270,60%,65%)] font-mono">
                        {monthsToGoal} {monthsToGoal === 1 ? 'month' : 'months'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-sm text-[hsl(0,70%,55%)]">Goal not reachable</span>
                      <span className="text-sm text-[hsl(0,70%,55%)]">Increase growth rate</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Timeline */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(142,69%,50%)/0.2] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[hsl(142,69%,50%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Customer Growth Timeline</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Click a month for details</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(211,100%,45%)/0.1] border border-[hsl(211,100%,45%)/0.3]">
                      <div className="w-3 h-3 rounded-full bg-[hsl(211,100%,45%)]" />
                      <span className="text-[hsl(226,100%,68%)] font-semibold">Start</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(142,69%,50%)/0.1] border border-[hsl(142,69%,50%)/0.3]">
                      <div className="w-3 h-3 rounded-full bg-[hsl(142,69%,50%)]" />
                      <span className="text-[hsl(152,100%,60%)] font-semibold">12mo</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Animated customer timeline */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  <AnimatePresence>
                    {projectionData.map((data, i) => {
                      const isStart = i === 0;
                      const isEnd = i === projectionData.length - 1;
                      const isSelected = selectedMonthIndex === i;
                      const growthPercent = i > 0 ? ((data.customers - projectionData[i - 1].customers) / projectionData[i - 1].customers) * 100 : 0;
                      
                      return (
                        <motion.div
                          key={data.month}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            scale: isSelected ? 1.05 : 1
                          }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.08, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 25 }}
                          onClick={() => setSelectedMonthIndex(isSelected ? null : i)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-[hsl(211,100%,45%)/0.3] to-[hsl(290,70%,45%)/0.2] border-[hsl(270,60%,65%)] shadow-lg shadow-[hsl(211,100%,45%)/0.3]'
                              : isStart 
                                ? 'bg-gradient-to-br from-[hsl(211,100%,45%)/0.2] to-[hsl(211,100%,45%)/0.1] border-[hsl(211,100%,45%)/0.5] hover:border-[hsl(211,100%,45%)] hover:shadow-lg hover:shadow-[hsl(211,100%,45%)/0.2]' 
                                : isEnd 
                                  ? 'bg-gradient-to-br from-[hsl(142,69%,50%)/0.2] to-[hsl(142,69%,50%)/0.1] border-[hsl(142,69%,50%)/0.5] hover:border-[hsl(142,69%,50%)] hover:shadow-lg hover:shadow-[hsl(142,69%,50%)/0.2]'
                                  : 'bg-[hsl(240,7%,15%)] border-white/10 hover:border-[hsl(211,100%,45%)/0.5] hover:bg-[hsl(240,7%,18%)] hover:shadow-lg hover:shadow-[hsl(211,100%,45%)/0.1]'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center gap-2">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${
                              isSelected ? 'text-[hsl(270,60%,75%)]' : isStart ? 'text-[hsl(226,100%,68%)]' : isEnd ? 'text-[hsl(152,100%,60%)]' : 'text-[hsl(220,10%,60%)]'
                            }`}>
                              {data.month}
                            </span>
                            <span className={`text-2xl font-bold ${isSelected ? 'text-[hsl(270,60%,75%)]' : isStart ? 'text-[hsl(226,100%,68%)]' : isEnd ? 'text-[hsl(152,100%,60%)]' : 'text-white'}`} style={{ fontFamily: 'JetBrains Mono' }}>
                              {data.customers}
                            </span>
                            {!isStart && growthPercent > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-[hsl(142,69%,50%)]">
                                <ArrowUp className="w-3 h-3" />
                                <span className="font-semibold">{growthPercent.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Selected Month Details */}
                <AnimatePresence>
                  {selectedMonthIndex !== null && projectionData[selectedMonthIndex] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(211,100%,45%)/0.15] to-[hsl(290,70%,45%)/0.1] border border-[hsl(211,100%,45%)/0.3]">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-[hsl(270,60%,75%)]">
                            {projectionData[selectedMonthIndex].month} Projection Details
                          </h4>
                          <button 
                            onClick={() => setSelectedMonthIndex(null)}
                            className="text-[hsl(220,10%,50%)] hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-[hsl(240,7%,12%)] border border-white/5">
                            <p className="text-[10px] text-[hsl(220,10%,50%)] uppercase tracking-wider mb-1">MRR</p>
                            <p className="text-lg font-bold text-white font-mono">{formatCurrency(projectionData[selectedMonthIndex].mrr)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[hsl(240,7%,12%)] border border-white/5">
                            <p className="text-[10px] text-[hsl(220,10%,50%)] uppercase tracking-wider mb-1">ARR</p>
                            <p className="text-lg font-bold text-white font-mono">{formatCurrency(projectionData[selectedMonthIndex].arr)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[hsl(240,7%,12%)] border border-white/5">
                            <p className="text-[10px] text-[hsl(220,10%,50%)] uppercase tracking-wider mb-1">Customers</p>
                            <p className="text-lg font-bold text-[hsl(152,100%,60%)] font-mono">{projectionData[selectedMonthIndex].customers}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[hsl(240,7%,12%)] border border-white/5">
                            <p className="text-[10px] text-[hsl(220,10%,50%)] uppercase tracking-wider mb-1">Growth</p>
                            <p className="text-lg font-bold text-[hsl(270,60%,65%)] font-mono">
                              {selectedMonthIndex > 0 
                                ? `+${(((projectionData[selectedMonthIndex].mrr - projectionData[selectedMonthIndex - 1].mrr) / projectionData[selectedMonthIndex - 1].mrr) * 100).toFixed(1)}%`
                                : '—'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ═══ AI INSIGHTS PANEL ═══ */}
          <AnimatePresence>
            {aiInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-[hsl(280,70%,50%)/0.15] via-[hsl(320,70%,50%)/0.1] to-[hsl(280,70%,50%)/0.05] border border-[hsl(280,70%,50%)/0.3]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(280,70%,50%)] to-[hsl(320,70%,50%)] flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">AI-Powered Insights</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Strategic analysis of your growth metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[hsl(220,10%,55%)]">Health Score</span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                        style={{ 
                          backgroundColor: `${getHealthColor(aiInsights.healthScore)}20`,
                          borderColor: `${getHealthColor(aiInsights.healthScore)}50`
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ 
                            backgroundColor: getHealthColor(aiInsights.healthScore),
                            color: aiInsights.healthScore >= 60 ? 'black' : 'white'
                          }}
                        >
                          {aiInsights.healthScore}
                        </div>
                        <span className="font-semibold" style={{ color: getHealthColor(aiInsights.healthScore) }}>
                          {aiInsights.healthLabel}
                        </span>
                      </motion.div>
                    </div>
                    <button 
                      onClick={() => setAiInsights(null)}
                      className="text-[hsl(220,10%,50%)] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Insight */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/10 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[hsl(280,70%,60%)] mt-0.5 flex-shrink-0" />
                    <p className="text-white font-medium">{aiInsights.primaryInsight}</p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Recommendations */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-[hsl(142,69%,50%)/0.2]"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(142,69%,50%)]" />
                      <h4 className="text-sm font-semibold text-[hsl(152,100%,60%)]">Recommendations</h4>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.recommendations.map((rec, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-start gap-2 text-sm text-[hsl(220,10%,70%)]"
                        >
                          <ArrowUp className="w-3 h-3 text-[hsl(142,69%,50%)] mt-1 flex-shrink-0" />
                          {rec}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Risks */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-[hsl(0,70%,55%)/0.2]"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-[hsl(0,70%,55%)]" />
                      <h4 className="text-sm font-semibold text-[hsl(0,70%,60%)]">Watch Out</h4>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.risks.map((risk, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-start gap-2 text-sm text-[hsl(220,10%,70%)]"
                        >
                          <Shield className="w-3 h-3 text-[hsl(0,70%,55%)] mt-1 flex-shrink-0" />
                          {risk}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Opportunities */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-[hsl(50,100%,50%)/0.2]"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-[hsl(50,100%,50%)]" />
                      <h4 className="text-sm font-semibold text-[hsl(50,100%,60%)]">Opportunities</h4>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.opportunities.map((opp, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-start gap-2 text-sm text-[hsl(220,10%,70%)]"
                        >
                          <Rocket className="w-3 h-3 text-[hsl(50,100%,50%)] mt-1 flex-shrink-0" />
                          {opp}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ FOOTER ACTIONS ═══ */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 pt-4 border-t border-white/5 flex justify-end"
          >
            <Button
              onClick={onClose}
              className="px-8 bg-gradient-to-r from-[hsl(211,100%,45%)] to-[hsl(290,70%,45%)] hover:from-[hsl(270,60%,60%)] hover:to-[hsl(290,70%,50%)] text-white font-semibold shadow-lg shadow-[hsl(211,100%,45%)/0.3]"
            >
              Done
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
