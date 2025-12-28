import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  Users, 
  Megaphone, 
  Settings, 
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface BurnRateCalculatorProps {
  initialData?: {
    monthly_burn?: number;
    cash_on_hand?: number;
  };
  onClose: () => void;
}

const EXPENSE_COLORS = [
  "hsl(211, 100%, 45%)",   // Payroll - Apple Blue
  "hsl(350, 75%, 50%)",    // Marketing - Red-pink
  "hsl(142, 69%, 50%)",    // Operations - Apple Green
  "hsl(35, 100%, 52%)",    // Other - Apple Orange
];

export const BurnRateCalculator = ({ initialData, onClose }: BurnRateCalculatorProps) => {
  const [inputs, setInputs] = useState({
    revenue: 25000,
    payroll: 45000,
    marketing: 12000,
    operations: 8000,
    other: 5000,
  });
  
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedBurn, setAnimatedBurn] = useState(0);

  const totalExpenses = inputs.payroll + inputs.marketing + inputs.operations + inputs.other;
  const netBurn = totalExpenses - inputs.revenue;
  const isPositive = netBurn < 0;

  useEffect(() => {
    const duration = 600;
    const steps = 30;
    const totalStep = (totalExpenses - animatedTotal) / steps;
    const burnStep = (netBurn - animatedBurn) / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimatedTotal(prev => prev + totalStep);
      setAnimatedBurn(prev => prev + burnStep);
      if (step >= steps) {
        clearInterval(interval);
        setAnimatedTotal(totalExpenses);
        setAnimatedBurn(netBurn);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [totalExpenses, netBurn]);

  const pieData = [
    { name: "Payroll", value: inputs.payroll, color: EXPENSE_COLORS[0] },
    { name: "Marketing", value: inputs.marketing, color: EXPENSE_COLORS[1] },
    { name: "Operations", value: inputs.operations, color: EXPENSE_COLORS[2] },
    { name: "Other", value: inputs.other, color: EXPENSE_COLORS[3] },
  ].filter(d => d.value > 0);

  const barData = [
    { name: "Revenue", value: inputs.revenue, fill: "hsl(142, 69%, 50%)" },
    { name: "Expenses", value: totalExpenses, fill: "hsl(211, 100%, 45%)" },
  ];

  const expenseCategories = [
    { key: "payroll", label: "Payroll", icon: Users, color: EXPENSE_COLORS[0], max: 100000 },
    { key: "marketing", label: "Marketing", icon: Megaphone, color: EXPENSE_COLORS[1], max: 50000 },
    { key: "operations", label: "Operations", icon: Settings, color: EXPENSE_COLORS[2], max: 30000 },
    { key: "other", label: "Other", icon: MoreHorizontal, color: EXPENSE_COLORS[3], max: 20000 },
  ];

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
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Burn Rate Calculator</h2>
              <p className="text-sm text-[hsl(0,0%,53%)]">Model your spending and visualize cash flow</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Inputs */}
          <div className="space-y-6">
            {/* Revenue Input */}
            <div className="card-surface p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[hsl(142,69%,50%,0.15)] flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[hsl(142,69%,50%)]" />
                </div>
                <div>
                  <Label className="text-white font-medium">Monthly Revenue</Label>
                  <p className="text-xs text-[hsl(0,0%,53%)]">Your incoming cash flow</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(0,0%,53%)] font-medium">$</span>
                <Input
                  type="number"
                  value={inputs.revenue}
                  onChange={(e) => setInputs(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                  className="pl-8 h-12 text-xl font-semibold"
                />
              </div>
            </div>

            {/* Expense Sliders */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[hsl(211,100%,45%)]" />
                Monthly Expenses
              </h3>
              
              {expenseCategories.map((cat) => (
                <div
                  key={cat.key}
                  className="card-surface p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${cat.color}15` }}
                      >
                        <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <span className="text-white font-medium text-sm">{cat.label}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(0,0%,40%)] text-xs">$</span>
                      <Input
                        type="number"
                        value={inputs[cat.key as keyof typeof inputs]}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setInputs(prev => ({ ...prev, [cat.key]: val }));
                        }}
                        className="h-8 w-24 pl-6 pr-2 text-sm font-mono"
                        min={0}
                        step={500}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[Math.min(inputs[cat.key as keyof typeof inputs] as number, cat.max)]}
                    onValueChange={([val]) => setInputs(prev => ({ ...prev, [cat.key]: val }))}
                    max={cat.max}
                    step={500}
                  />
                  {(inputs[cat.key as keyof typeof inputs] as number) > cat.max && (
                    <p className="text-xs mt-1 text-right" style={{ color: cat.color }}>
                      Above ${cat.max.toLocaleString()} range
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visualization */}
          <div className="space-y-6">
            {/* Main Result Card */}
            <div className="card-surface p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-[hsl(0,0%,53%)] text-xs uppercase tracking-wider mb-2">Total Expenses</p>
                  <div className="text-3xl font-semibold text-white font-mono">
                    ${Math.round(animatedTotal).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[hsl(0,0%,53%)] text-xs uppercase tracking-wider mb-2">Net Burn Rate</p>
                  <div className={`text-3xl font-semibold font-mono flex items-center justify-center gap-2 ${
                    isPositive ? "text-[hsl(142,69%,50%)]" : "text-[hsl(0,100%,62%)]"
                  }`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {isPositive ? "+" : ""}${Math.abs(Math.round(animatedBurn)).toLocaleString()}
                  </div>
                  <p className="text-xs text-[hsl(0,0%,53%)] mt-1">per month</p>
                </div>
              </div>

              {isPositive && (
                <div className="mt-4 p-3 rounded-lg bg-[hsl(142,69%,50%,0.1)] border border-[hsl(142,69%,50%,0.2)] flex items-center gap-2">
                  <span className="text-sm text-[hsl(142,69%,50%)] font-medium">
                    Profitable: Revenue exceeds expenses
                  </span>
                </div>
              )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="card-surface p-4">
                <h4 className="text-xs font-medium text-[hsl(0,0%,53%)] mb-3 text-center">Expense Breakdown</h4>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(0,0%,11%)",
                          border: "1px solid hsl(0,0%,100%,0.08)",
                          borderRadius: "8px",
                          color: "white"
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-[hsl(0,0%,53%)]">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="card-surface p-4">
                <h4 className="text-xs font-medium text-[hsl(0,0%,53%)] mb-3 text-center">Revenue vs Expenses</h4>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barGap={16}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "hsl(0,0%,53%)", fontSize: 11 }}
                      />
                      <YAxis hide />
                      <Bar 
                        dataKey="value" 
                        radius={[6, 6, 0, 0]}
                      >
                        {barData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(0,0%,11%)",
                          border: "1px solid hsl(0,0%,100%,0.08)",
                          borderRadius: "8px",
                          color: "white"
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="card-surface p-4">
              <h4 className="text-sm font-medium text-white mb-3">Insights</h4>
              <ul className="space-y-1.5 text-sm text-[hsl(0,0%,53%)]">
                <li>• Payroll is {((inputs.payroll / totalExpenses) * 100).toFixed(0)}% of total expenses</li>
                <li>• {isPositive ? "Generating" : "Burning"} ${Math.abs(netBurn).toLocaleString()}/month</li>
                {inputs.payroll > inputs.revenue && (
                  <li className="text-[hsl(35,100%,52%)]">• Payroll exceeds revenue</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
