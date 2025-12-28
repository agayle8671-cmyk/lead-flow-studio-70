import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface GrowthTrackerProps {
  onClose: () => void;
}

interface MonthlyData {
  month: string;
  mrr: number;
  customers: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GrowthTracker({ onClose }: GrowthTrackerProps) {
  const [currentMRR, setCurrentMRR] = useState(15000);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(12);
  const [avgRevenuePerUser, setAvgRevenuePerUser] = useState(99);
  const [churnRate, setChurnRate] = useState(3);
  const [projectionData, setProjectionData] = useState<MonthlyData[]>([]);

  // Calculate projections whenever inputs change
  useEffect(() => {
    const data: MonthlyData[] = [];
    let mrr = currentMRR;
    let customers = avgRevenuePerUser > 0 ? Math.round(currentMRR / avgRevenuePerUser) : 0;
    
    const currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      data.push({
        month: MONTHS[monthIndex],
        mrr: Math.round(mrr),
        customers: customers
      });
      
      // Apply growth and churn
      const growthMultiplier = 1 + (monthlyGrowthRate / 100);
      const churnMultiplier = 1 - (churnRate / 100);
      mrr = mrr * growthMultiplier * churnMultiplier;
      customers = avgRevenuePerUser > 0 ? Math.round(mrr / avgRevenuePerUser) : 0;
    }
    
    setProjectionData(data);
  }, [currentMRR, monthlyGrowthRate, avgRevenuePerUser, churnRate]);

  const projectedARR = projectionData.length > 0 ? projectionData[projectionData.length - 1].mrr * 12 : 0;
  const currentARR = currentMRR * 12;
  const arrGrowth = currentARR > 0 ? ((projectedARR - currentARR) / currentARR) * 100 : 0;
  const netGrowthRate = monthlyGrowthRate - churnRate;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-[hsl(270,60%,55%)/0.2] shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-8 pb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(270,60%,55%)/0.1] via-transparent to-[hsl(152,100%,50%)/0.1]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-[hsl(270,60%,55%)/0.15] blur-[80px] rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(290,70%,45%)] flex items-center justify-center shadow-lg shadow-[hsl(270,60%,55%)/0.3]">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Growth Tracker</h2>
                <p className="text-[hsl(220,10%,55%)]">Monitor and project your MRR & ARR</p>
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

        {/* Content */}
        <div className="p-8 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[hsl(270,60%,55%)]" />
                Revenue Metrics
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                    Current MRR
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)]">$</span>
                    <Input
                      type="number"
                      value={currentMRR}
                      onChange={(e) => setCurrentMRR(Number(e.target.value))}
                      className="pl-7 bg-[hsl(240,7%,8%)] border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                    Monthly Growth Rate
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={monthlyGrowthRate}
                      onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
                      className="pr-7 bg-[hsl(240,7%,8%)] border-white/10 text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)]">%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                    Avg Revenue Per User (ARPU)
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)]">$</span>
                    <Input
                      type="number"
                      value={avgRevenuePerUser}
                      onChange={(e) => setAvgRevenuePerUser(Number(e.target.value))}
                      className="pl-7 bg-[hsl(240,7%,8%)] border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                    Monthly Churn Rate
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={churnRate}
                      onChange={(e) => setChurnRate(Number(e.target.value))}
                      className="pr-7 bg-[hsl(240,7%,8%)] border-white/10 text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)]">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Growth Indicator */}
            <div className={`p-4 rounded-2xl border ${netGrowthRate >= 0 ? 'bg-[hsl(152,100%,50%)/0.08] border-[hsl(152,100%,50%)/0.2]' : 'bg-[hsl(0,70%,55%)/0.08] border-[hsl(0,70%,55%)/0.2]'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)]">Net Growth Rate</span>
                <div className={`flex items-center gap-1 ${netGrowthRate >= 0 ? 'text-[hsl(152,100%,50%)]' : 'text-[hsl(0,70%,55%)]'}`}>
                  {netGrowthRate > 0 ? <ArrowUp className="w-4 h-4" /> : netGrowthRate < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  <span className="text-xl font-bold">{netGrowthRate.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs text-[hsl(220,10%,50%)] mt-1">Growth ({monthlyGrowthRate}%) - Churn ({churnRate}%)</p>
            </div>
          </div>

          {/* Chart & Projections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[hsl(270,60%,55%)/0.08] border border-[hsl(270,60%,55%)/0.2]">
                <p className="text-xs uppercase tracking-wider text-[hsl(270,60%,65%)] mb-1">Current ARR</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentARR)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[hsl(152,100%,50%)/0.08] border border-[hsl(152,100%,50%)/0.2]">
                <p className="text-xs uppercase tracking-wider text-[hsl(152,100%,60%)] mb-1">Projected ARR (12mo)</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(projectedARR)}</p>
              </div>
              <div className={`p-4 rounded-2xl ${arrGrowth >= 0 ? 'bg-[hsl(152,100%,50%)/0.08] border-[hsl(152,100%,50%)/0.2]' : 'bg-[hsl(0,70%,55%)/0.08] border-[hsl(0,70%,55%)/0.2]'} border`}>
                <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)] mb-1">YoY Growth</p>
                <div className={`flex items-center gap-1 ${arrGrowth >= 0 ? 'text-[hsl(152,100%,50%)]' : 'text-[hsl(0,70%,55%)]'}`}>
                  {arrGrowth >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                  <span className="text-2xl font-bold">{Math.abs(arrGrowth).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* MRR Projection Chart */}
            <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-[hsl(270,60%,55%)]" />
                <h3 className="text-white font-semibold">12-Month MRR Projection</h3>
              </div>
              
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 20%)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(240,7%,12%)",
                        border: "1px solid hsl(270,60%,55%,0.3)",
                        borderRadius: "12px",
                        color: "white",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "MRR"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="mrr"
                      stroke="hsl(270, 60%, 55%)"
                      strokeWidth={2}
                      fill="url(#mrrGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Projection */}
            <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                  <h3 className="text-white font-semibold">Customer Growth</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[hsl(220,10%,50%)]" />
                    <span className="text-[hsl(220,10%,55%)]">Today: <span className="text-white font-semibold">{projectionData[0]?.customers || 0}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                    <span className="text-[hsl(220,10%,55%)]">12mo: <span className="text-[hsl(152,100%,50%)] font-semibold">{projectionData[projectionData.length - 1]?.customers || 0}</span></span>
                  </div>
                </div>
              </div>
              
              {/* Customer count pills */}
              <div className="flex gap-2 flex-wrap">
                {projectionData.map((data, i) => (
                  <div
                    key={data.month}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      i === 0 
                        ? 'bg-[hsl(226,100%,59%)/0.2] text-[hsl(226,100%,68%)]' 
                        : i === projectionData.length - 1 
                          ? 'bg-[hsl(152,100%,50%)/0.2] text-[hsl(152,100%,60%)]'
                          : 'bg-[hsl(240,7%,18%)] text-[hsl(220,10%,60%)]'
                    }`}
                  >
                    {data.month}: {data.customers}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 flex justify-end">
          <Button
            onClick={onClose}
            className="px-8 bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(290,70%,45%)] hover:from-[hsl(270,60%,60%)] hover:to-[hsl(290,70%,50%)] text-white font-semibold"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

