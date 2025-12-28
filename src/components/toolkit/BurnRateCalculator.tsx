import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  Users, 
  Megaphone, 
  Settings, 
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  Flame,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface BurnRateCalculatorProps {
  initialData?: {
    monthly_burn?: number;
    cash_on_hand?: number;
  };
  onClose: () => void;
}

const EXPENSE_COLORS = [
  "hsl(226, 100%, 59%)",   // Payroll - Blue
  "hsl(340, 80%, 55%)",    // Marketing - Pink
  "hsl(152, 100%, 50%)",   // Operations - Green
  "hsl(45, 90%, 55%)",     // Other - Gold
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

  // Animate numbers
  useEffect(() => {
    const duration = 800;
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
    { name: "Revenue", value: inputs.revenue, fill: "hsl(152, 100%, 50%)" },
    { name: "Expenses", value: totalExpenses, fill: "hsl(0, 70%, 55%)" },
  ];

  const expenseCategories = [
    { key: "payroll", label: "Payroll", icon: Users, color: EXPENSE_COLORS[0], max: 100000 },
    { key: "marketing", label: "Marketing", icon: Megaphone, color: EXPENSE_COLORS[1], max: 50000 },
    { key: "operations", label: "Operations", icon: Settings, color: EXPENSE_COLORS[2], max: 30000 },
    { key: "other", label: "Other", icon: MoreHorizontal, color: EXPENSE_COLORS[3], max: 20000 },
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
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(250,20%,10%)] to-[hsl(240,15%,8%)] border border-[hsl(226,100%,59%)/0.2] shadow-2xl shadow-[hsl(226,100%,59%)/0.1]"
      >
        {/* Header */}
        <div className="relative p-8 pb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(226,100%,59%)/0.1] via-transparent to-[hsl(340,80%,55%)/0.1]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[hsl(226,100%,59%)/0.15] blur-[100px] rounded-full" />
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(280,80%,55%)] flex items-center justify-center shadow-lg shadow-[hsl(226,100%,59%)/0.3]">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Burn Rate Calculator</h2>
              <p className="text-[hsl(220,10%,55%)]">Model your spending and visualize cash flow</p>
            </div>
          </motion.div>
        </div>

        <div className="p-8 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Inputs */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Revenue Input */}
            <div className="p-5 rounded-2xl bg-[hsl(152,100%,50%)/0.08] border border-[hsl(152,100%,50%)/0.2]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(152,100%,50%)/0.2] flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                </div>
                <div>
                  <Label className="text-[hsl(152,100%,50%)] font-semibold">Monthly Revenue</Label>
                  <p className="text-xs text-[hsl(220,10%,50%)]">Your incoming cash flow</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(152,100%,50%)] font-bold">$</span>
                <Input
                  type="number"
                  value={inputs.revenue}
                  onChange={(e) => setInputs(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                  className="pl-8 h-14 text-2xl font-bold bg-[hsl(240,7%,12%)] border-[hsl(152,100%,50%)/0.3] text-white focus:border-[hsl(152,100%,50%)]"
                />
              </div>
            </div>

            {/* Expense Sliders */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                Monthly Expenses
              </h3>
              
              {expenseCategories.map((cat, index) => (
                <motion.div
                  key={cat.key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-xl bg-[hsl(240,7%,10%)] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${cat.color}20` }}
                      >
                        <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <span className="text-white font-medium">{cat.label}</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: cat.color }}>
                      ${inputs[cat.key as keyof typeof inputs].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[inputs[cat.key as keyof typeof inputs]]}
                    onValueChange={([val]) => setInputs(prev => ({ ...prev, [cat.key]: val }))}
                    max={cat.max}
                    step={500}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[hsl(240,7%,15%)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                    style={{ 
                      // @ts-ignore
                      "--slider-track": cat.color 
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visualization */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Main Result Card */}
            <div className="relative p-6 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(226,100%,59%)/0.15] to-[hsl(280,80%,55%)/0.15]" />
              <div className="absolute inset-0 backdrop-blur-xl bg-[hsl(240,7%,8%)/0.7]" />
              
              <div className="relative grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-wider mb-2">Total Expenses</p>
                  <motion.div 
                    key={totalExpenses}
                    className="text-4xl font-bold text-white font-mono"
                  >
                    ${Math.round(animatedTotal).toLocaleString()}
                  </motion.div>
                </div>
                <div className="text-center">
                  <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-wider mb-2">Net Burn Rate</p>
                  <motion.div 
                    key={netBurn}
                    className={`text-4xl font-bold font-mono flex items-center justify-center gap-2 ${isPositive ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}
                  >
                    {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    {isPositive ? "+" : "-"}${Math.abs(Math.round(animatedBurn)).toLocaleString()}
                  </motion.div>
                  <p className="text-xs text-[hsl(220,10%,50%)] mt-1">per month</p>
                </div>
              </div>

              {isPositive && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mt-4 p-3 rounded-xl bg-[hsl(152,100%,50%)/0.1] border border-[hsl(152,100%,50%)/0.3] flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                  <span className="text-[hsl(152,100%,50%)] text-sm font-medium">
                    You're profitable! Revenue exceeds expenses.
                  </span>
                </motion.div>
              )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5">
                <h4 className="text-sm font-medium text-[hsl(220,10%,60%)] mb-2 text-center">Expense Breakdown</h4>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(240,7%,12%)",
                          border: "1px solid hsl(226,100%,59%,0.3)",
                          borderRadius: "12px",
                          color: "white"
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-[hsl(220,10%,55%)]">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5">
                <h4 className="text-sm font-medium text-[hsl(220,10%,60%)] mb-2 text-center">Revenue vs Expenses</h4>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barGap={20}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "hsl(220,10%,55%)", fontSize: 11 }}
                      />
                      <YAxis hide />
                      <Bar 
                        dataKey="value" 
                        radius={[8, 8, 0, 0]}
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {barData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(240,7%,12%)",
                          border: "1px solid hsl(226,100%,59%,0.3)",
                          borderRadius: "12px",
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
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl bg-gradient-to-r from-[hsl(226,100%,59%)/0.1] to-transparent border border-[hsl(226,100%,59%)/0.2]"
            >
              <h4 className="text-sm font-medium text-[hsl(226,100%,68%)] mb-2">Quick Insights</h4>
              <ul className="space-y-1 text-sm text-[hsl(220,10%,60%)]">
                <li>• Payroll is {((inputs.payroll / totalExpenses) * 100).toFixed(0)}% of total expenses</li>
                <li>• {isPositive ? "Generating" : "Burning"} ${Math.abs(netBurn).toLocaleString()}/month</li>
                {inputs.payroll > inputs.revenue && (
                  <li className="text-[hsl(45,90%,55%)]">• Payroll alone exceeds revenue</li>
                )}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
