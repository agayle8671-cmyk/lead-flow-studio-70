import { useState, useEffect, useMemo } from "react";
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
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  ReferenceLine
} from "recharts";

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
            <span className="text-[hsl(152,100%,50%)] font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
              {formatCurrency(data.arr)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">Customers:</span>
            <span className="text-white font-semibold">{data.customers}</span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-white/10">
            <span className="text-[hsl(220,10%,55%)]">MoM Growth:</span>
            <span className={`font-bold ${data.growth >= 0 ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}>
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-white/10 shadow-2xl"
      >
        {/* ═══════════════════════════════════════════════════════════════════
            CINEMATIC HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative p-8 pb-6 overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(270,60%,55%)/0.15] via-transparent to-[hsl(152,100%,50%)/0.1]" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[200px] bg-[hsl(270,60%,55%)/0.2] blur-[100px] rounded-full" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[180px] bg-[hsl(152,100%,50%)/0.15] blur-[90px] rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)] via-[hsl(280,65%,50%)] to-[hsl(290,70%,45%)] flex items-center justify-center shadow-xl shadow-[hsl(270,60%,55%)/0.4]"
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  Growth Tracker
                  {netGrowthRate > 10 && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl"
                    >
                      🚀
                    </motion.span>
                  )}
                </h2>
                <p className="text-[hsl(220,10%,55%)] mt-1">
                  MRR & ARR projections with growth modeling
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="p-8 pt-6">
          {/* ═══ HERO METRICS ═══ */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Current MRR - Hero Display */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)/0.15] via-[hsl(270,60%,55%)/0.08] to-transparent border border-[hsl(270,60%,55%)/0.3] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(270,60%,55%)/0.2] blur-[60px] rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-[hsl(270,60%,65%)]" />
                  <span className="text-xs uppercase tracking-wider text-[hsl(270,60%,65%)]">Current MRR</span>
                </div>
                <motion.p
                  key={animatedMRR}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold text-white mb-1"
                  style={{ fontFamily: 'JetBrains Mono' }}
                >
                  {formatCurrency(animatedMRR)}
                </motion.p>
                <p className="text-sm text-[hsl(220,10%,50%)]">
                  Monthly Recurring Revenue
                </p>
              </div>
            </div>

            {/* Projected ARR */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(152,100%,50%)/0.15] via-[hsl(152,100%,50%)/0.08] to-transparent border border-[hsl(152,100%,50%)/0.3] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[hsl(152,100%,50%)/0.2] blur-[50px] rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 text-[hsl(152,100%,60%)]" />
                  <span className="text-xs uppercase tracking-wider text-[hsl(152,100%,60%)]">12-Month ARR</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono' }}>
                  {formatCurrency(projectedARR)}
                </p>
                <div className={`flex items-center gap-1 text-sm ${arrGrowth >= 0 ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}>
                  {arrGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-semibold">{Math.abs(arrGrowth).toFixed(0)}%</span>
                  <span className="text-[hsl(220,10%,50%)]">YoY</span>
                </div>
              </div>
            </div>

            {/* Net Growth Rate */}
            <div className={`p-6 rounded-2xl border relative overflow-hidden ${
              netGrowthRate >= 10 
                ? 'bg-gradient-to-br from-[hsl(152,100%,50%)/0.15] to-transparent border-[hsl(152,100%,50%)/0.3]'
                : netGrowthRate >= 0
                  ? 'bg-gradient-to-br from-[hsl(45,90%,55%)/0.15] to-transparent border-[hsl(45,90%,55%)/0.3]'
                  : 'bg-gradient-to-br from-[hsl(0,70%,55%)/0.15] to-transparent border-[hsl(0,70%,55%)/0.3]'
            }`}>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" style={{ color: netGrowthRate >= 10 ? "hsl(152,100%,60%)" : netGrowthRate >= 0 ? "hsl(45,90%,55%)" : "hsl(0,70%,55%)" }} />
                  <span className={`text-xs uppercase tracking-wider ${
                    netGrowthRate >= 10 ? "text-[hsl(152,100%,60%)]" : netGrowthRate >= 0 ? "text-[hsl(45,90%,55%)]" : "text-[hsl(0,70%,55%)]"
                  }`}>
                    Net Growth
                  </span>
                </div>
                <div className={`flex items-center gap-2 ${netGrowthRate >= 10 ? 'text-[hsl(152,100%,50%)]' : netGrowthRate >= 0 ? 'text-[hsl(45,90%,55%)]' : 'text-[hsl(0,70%,55%)]'}`}>
                  {netGrowthRate > 0 ? <ArrowUp className="w-5 h-5" /> : netGrowthRate < 0 ? <ArrowDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  <p className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                    {netGrowthRate.toFixed(1)}%
                  </p>
                </div>
                <p className="text-xs text-[hsl(220,10%,50%)] mt-1">
                  {monthlyGrowthRate}% growth - {churnRate}% churn
                </p>
              </div>
            </div>
          </motion.div>

          {/* ═══ MAIN GRID ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ═══ LEFT PANEL: CONTROLS ═══ */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Revenue Metrics Card */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(270,60%,55%)/0.2] flex items-center justify-center">
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
                        className="pl-8 h-11 bg-[hsl(240,7%,8%)] border-white/10 text-white font-mono"
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
                        className="h-6 w-16 text-xs bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono text-center focus:border-[hsl(152,100%,50%)]/50"
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
                        {monthlyGrowthRate > 50 && <span className="text-[hsl(152,100%,50%)]">+</span>}
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
                        className="pl-8 h-11 bg-[hsl(240,7%,8%)] border-white/10 text-white font-mono"
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
                        className="h-6 w-16 text-xs bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono text-center focus:border-[hsl(0,70%,55%)]/50"
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
                  ? 'bg-gradient-to-br from-[hsl(152,100%,50%)/0.1] to-transparent border-[hsl(152,100%,50%)/0.3]'
                  : netGrowthRate >= 10
                    ? 'bg-gradient-to-br from-[hsl(152,70%,45%)/0.1] to-transparent border-[hsl(152,70%,45%)/0.3]'
                    : netGrowthRate >= 5
                      ? 'bg-gradient-to-br from-[hsl(45,90%,55%)/0.1] to-transparent border-[hsl(45,90%,55%)/0.3]'
                      : 'bg-gradient-to-br from-[hsl(0,70%,55%)/0.1] to-transparent border-[hsl(0,70%,55%)/0.3]'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {netGrowthRate >= 15 ? (
                    <Award className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                  ) : netGrowthRate >= 10 ? (
                    <Target className="w-5 h-5 text-[hsl(152,70%,45%)]" />
                  ) : netGrowthRate >= 5 ? (
                    <TrendingUp className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-[hsl(0,70%,55%)]" />
                  )}
                  <span className={`text-sm font-semibold ${
                    netGrowthRate >= 15 ? "text-[hsl(152,100%,50%)]" : netGrowthRate >= 10 ? "text-[hsl(152,70%,45%)]" : netGrowthRate >= 5 ? "text-[hsl(45,90%,55%)]" : "text-[hsl(0,70%,55%)]"
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
              className="lg:col-span-2 space-y-6"
            >
              {/* MRR Projection Chart */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(270,60%,55%)/0.2] flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-[hsl(270,60%,65%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">12-Month MRR Projection</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Compound growth with churn modeling</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(270,60%,55%)/0.1] border border-[hsl(270,60%,55%)/0.3]">
                    <Sparkles className="w-3 h-3 text-[hsl(270,60%,65%)]" />
                    <span className="text-xs text-[hsl(270,60%,65%)] font-semibold">Interactive</span>
                  </div>
                </div>
                
                <div className="h-[350px]">
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
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[hsl(226,100%,59%)/0.1] to-transparent border border-[hsl(226,100%,59%)/0.3]">
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
                    ? 'bg-gradient-to-br from-[hsl(152,100%,50%)/0.1] to-transparent border-[hsl(152,100%,50%)/0.3]'
                    : customerGrowth >= 25
                      ? 'bg-gradient-to-br from-[hsl(45,90%,55%)/0.1] to-transparent border-[hsl(45,90%,55%)/0.3]'
                      : 'bg-gradient-to-br from-[hsl(0,70%,55%)/0.1] to-transparent border-[hsl(0,70%,55%)/0.3]'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4" style={{ color: customerGrowth >= 50 ? "hsl(152,100%,50%)" : customerGrowth >= 25 ? "hsl(45,90%,55%)" : "hsl(0,70%,55%)" }} />
                    <span className={`text-xs uppercase tracking-wider ${
                      customerGrowth >= 50 ? "text-[hsl(152,100%,50%)]" : customerGrowth >= 25 ? "text-[hsl(45,90%,55%)]" : "text-[hsl(0,70%,55%)]"
                    }`}>
                      Growth
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 ${customerGrowth >= 50 ? 'text-[hsl(152,100%,50%)]' : customerGrowth >= 25 ? 'text-[hsl(45,90%,55%)]' : 'text-[hsl(0,70%,55%)]'}`}>
                    {customerGrowth >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                      {Math.abs(customerGrowth).toFixed(0)}%
                    </p>
                  </div>
                  <p className="text-xs text-[hsl(220,10%,50%)] mt-1">12 months</p>
                </div>
              </div>

              {/* Customer Timeline */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                    <h3 className="text-white font-semibold">Customer Growth Timeline</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[hsl(226,100%,59%)]" />
                      <span className="text-[hsl(220,10%,55%)]">Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[hsl(152,100%,50%)]" />
                      <span className="text-[hsl(220,10%,55%)]">12mo</span>
                    </div>
                  </div>
                </div>
                
                {/* Animated customer timeline */}
                <div className="flex gap-2 flex-wrap">
                  <AnimatePresence>
                    {projectionData.map((data, i) => (
                      <motion.div
                        key={data.month}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: i * 0.02 }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          i === 0 
                            ? 'bg-[hsl(226,100%,59%)/0.2] border border-[hsl(226,100%,59%)/0.4] text-[hsl(226,100%,68%)]' 
                            : i === projectionData.length - 1 
                              ? 'bg-[hsl(152,100%,50%)/0.2] border border-[hsl(152,100%,50%)/0.4] text-[hsl(152,100%,60%)]'
                              : 'bg-[hsl(240,7%,18%)] border border-white/5 text-[hsl(220,10%,70%)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{data.month}</span>
                          <span className="text-xs opacity-75">{data.customers}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═══ FOOTER ACTIONS ═══ */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 pt-6 border-t border-white/5 flex justify-end"
          >
            <Button
              onClick={onClose}
              className="px-8 bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(290,70%,45%)] hover:from-[hsl(270,60%,60%)] hover:to-[hsl(290,70%,50%)] text-white font-semibold shadow-lg shadow-[hsl(270,60%,55%)/0.3]"
            >
              Done
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
