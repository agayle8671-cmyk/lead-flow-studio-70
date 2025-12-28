import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Users, 
  DollarSign, 
  UserPlus,
  TrendingDown,
  Calendar,
  Briefcase,
  Code,
  Megaphone,
  HeadphonesIcon,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";

interface HiringPlannerProps {
  initialData?: {
    monthly_burn?: number;
    cash_on_hand?: number;
    runway_months?: number;
  };
  onClose: () => void;
}

interface HireRole {
  id: string;
  title: string;
  icon: typeof Users;
  salary: number;
  count: number;
  startMonth: number;
  color: string;
}

const DEFAULT_ROLES: HireRole[] = [
  { id: "eng", title: "Engineer", icon: Code, salary: 12000, count: 0, startMonth: 1, color: "hsl(226, 100%, 59%)" },
  { id: "sales", title: "Sales", icon: Megaphone, salary: 8000, count: 0, startMonth: 1, color: "hsl(152, 100%, 50%)" },
  { id: "support", title: "Support", icon: HeadphonesIcon, salary: 5000, count: 0, startMonth: 1, color: "hsl(45, 90%, 55%)" },
  { id: "ops", title: "Operations", icon: Briefcase, salary: 7000, count: 0, startMonth: 1, color: "hsl(270, 60%, 55%)" },
];

export function HiringPlanner({ initialData, onClose }: HiringPlannerProps) {
  const [currentBurn, setCurrentBurn] = useState(initialData?.monthly_burn || 45000);
  const [cashOnHand, setCashOnHand] = useState(initialData?.cash_on_hand || 500000);
  const [roles, setRoles] = useState<HireRole[]>(DEFAULT_ROLES);
  const [projectionMonths, setProjectionMonths] = useState(12);

  // Calculate projections
  const [burnProjection, setBurnProjection] = useState<{ month: string; burn: number; cumulative: number }[]>([]);
  const [currentRunway, setCurrentRunway] = useState(0);
  const [projectedRunway, setProjectedRunway] = useState(0);

  useEffect(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    const projection: { month: string; burn: number; cumulative: number }[] = [];
    let cumulativeCash = cashOnHand;
    let runwayHit = false;
    let runwayMonth = projectionMonths;

    for (let i = 0; i < projectionMonths; i++) {
      const monthIndex = (currentMonth + i) % 12;
      
      // Calculate additional burn from new hires this month
      const additionalBurn = roles.reduce((sum, role) => {
        if (i + 1 >= role.startMonth) {
          return sum + (role.salary * role.count);
        }
        return sum;
      }, 0);
      
      const monthlyBurn = currentBurn + additionalBurn;
      cumulativeCash -= monthlyBurn;
      
      if (cumulativeCash <= 0 && !runwayHit) {
        runwayHit = true;
        runwayMonth = i + 1;
      }
      
      projection.push({
        month: months[monthIndex],
        burn: monthlyBurn,
        cumulative: Math.max(0, cumulativeCash)
      });
    }
    
    setBurnProjection(projection);
    setCurrentRunway(currentBurn > 0 ? cashOnHand / currentBurn : 0);
    setProjectedRunway(runwayMonth);
  }, [currentBurn, cashOnHand, roles, projectionMonths]);

  const updateRole = (id: string, field: keyof HireRole, value: number) => {
    setRoles(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const totalNewHires = roles.reduce((sum, role) => sum + role.count, 0);
  const totalAdditionalBurn = roles.reduce((sum, role) => sum + (role.salary * role.count), 0);
  const runwayImpact = currentRunway - projectedRunway;

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
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-[hsl(45,90%,55%)/0.2] shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-8 pb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(45,90%,55%)/0.1] via-transparent to-[hsl(226,100%,59%)/0.1]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-[hsl(45,90%,55%)/0.15] blur-[80px] rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(45,90%,55%)] to-[hsl(35,100%,50%)] flex items-center justify-center shadow-lg shadow-[hsl(45,90%,55%)/0.3]">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hiring Planner</h2>
                <p className="text-[hsl(220,10%,55%)]">Plan team growth and see burn rate impact</p>
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
          {/* Current State & Roles */}
          <div className="space-y-5">
            {/* Current Financials */}
            <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                Current Financials
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                    Monthly Burn
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)]">$</span>
                    <Input
                      type="number"
                      value={currentBurn}
                      onChange={(e) => setCurrentBurn(Number(e.target.value))}
                      className="pl-7 bg-[hsl(240,7%,8%)] border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                    Cash on Hand
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)]">$</span>
                    <Input
                      type="number"
                      value={cashOnHand}
                      onChange={(e) => setCashOnHand(Number(e.target.value))}
                      className="pl-7 bg-[hsl(240,7%,8%)] border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hire Roles */}
            <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                Plan New Hires
              </h3>
              
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="p-3 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${role.color}20` }}
                      >
                        <role.icon className="w-4 h-4" style={{ color: role.color }} />
                      </div>
                      <span className="text-white font-medium text-sm">{role.title}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[hsl(220,10%,50%)] text-[10px] uppercase">Salary/mo</Label>
                        <Input
                          type="number"
                          value={role.salary}
                          onChange={(e) => updateRole(role.id, "salary", Number(e.target.value))}
                          className="h-8 text-sm bg-[hsl(240,7%,12%)] border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-[hsl(220,10%,50%)] text-[10px] uppercase"># Hires</Label>
                        <Input
                          type="number"
                          min={0}
                          value={role.count}
                          onChange={(e) => updateRole(role.id, "count", Math.max(0, Number(e.target.value)))}
                          className="h-8 text-sm bg-[hsl(240,7%,12%)] border-white/10 text-white"
                        />
                      </div>
                    </div>
                    
                    {role.count > 0 && (
                      <div className="mt-2">
                        <Label className="text-[hsl(220,10%,50%)] text-[10px] uppercase">Start Month: {role.startMonth}</Label>
                        <Slider
                          value={[role.startMonth]}
                          min={1}
                          max={12}
                          step={1}
                          onValueChange={(value) => updateRole(role.id, "startMonth", value[0])}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[hsl(226,100%,59%)/0.08] border border-[hsl(226,100%,59%)/0.2]">
                <p className="text-[10px] uppercase tracking-wider text-[hsl(226,100%,68%)] mb-1">New Hires</p>
                <p className="text-2xl font-bold text-white">{totalNewHires}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[hsl(0,70%,55%)/0.08] border border-[hsl(0,70%,55%)/0.2]">
                <p className="text-[10px] uppercase tracking-wider text-[hsl(0,70%,65%)] mb-1">+Burn/mo</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAdditionalBurn)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[hsl(152,100%,50%)/0.08] border border-[hsl(152,100%,50%)/0.2]">
                <p className="text-[10px] uppercase tracking-wider text-[hsl(152,100%,60%)] mb-1">Current Runway</p>
                <p className="text-2xl font-bold text-white">{currentRunway.toFixed(1)}mo</p>
              </div>
              <div className={`p-4 rounded-2xl ${runwayImpact > 0 ? 'bg-[hsl(0,70%,55%)/0.08] border-[hsl(0,70%,55%)/0.2]' : 'bg-[hsl(152,100%,50%)/0.08] border-[hsl(152,100%,50%)/0.2]'} border`}>
                <p className="text-[10px] uppercase tracking-wider text-[hsl(220,10%,55%)] mb-1">Projected</p>
                <p className="text-2xl font-bold text-white">{projectedRunway}mo</p>
              </div>
            </div>

            {/* Runway Impact Warning */}
            {totalNewHires > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl flex items-center gap-4 ${
                  projectedRunway < 6 
                    ? 'bg-[hsl(0,70%,55%)/0.1] border border-[hsl(0,70%,55%)/0.3]'
                    : projectedRunway < 12
                      ? 'bg-[hsl(45,90%,55%)/0.1] border border-[hsl(45,90%,55%)/0.3]'
                      : 'bg-[hsl(152,100%,50%)/0.1] border border-[hsl(152,100%,50%)/0.3]'
                }`}
              >
                {projectedRunway < 6 ? (
                  <AlertTriangle className="w-6 h-6 text-[hsl(0,70%,55%)]" />
                ) : projectedRunway < 12 ? (
                  <AlertTriangle className="w-6 h-6 text-[hsl(45,90%,55%)]" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-[hsl(152,100%,50%)]" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {projectedRunway < 6 
                      ? "Critical: Runway drops below 6 months"
                      : projectedRunway < 12
                        ? "Warning: Consider fundraising timeline"
                        : "Healthy runway maintained with planned hires"
                    }
                  </p>
                  <p className="text-[hsl(220,10%,55%)] text-sm">
                    {totalNewHires} hire{totalNewHires > 1 ? 's' : ''} adding {formatCurrency(totalAdditionalBurn)}/mo reduces runway by {runwayImpact.toFixed(1)} months
                  </p>
                </div>
              </motion.div>
            )}

            {/* Burn Rate Projection Chart */}
            <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                <h3 className="text-white font-semibold">Monthly Burn Projection</h3>
              </div>
              
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={burnProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        border: "1px solid hsl(45,90%,55%,0.3)",
                        borderRadius: "12px",
                        color: "white",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Burn"]}
                    />
                    <ReferenceLine y={currentBurn} stroke="hsl(220, 10%, 40%)" strokeDasharray="4 4" />
                    <Bar dataKey="burn" radius={[4, 4, 0, 0]}>
                      {burnProjection.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.burn > currentBurn ? "hsl(0, 70%, 55%)" : "hsl(45, 90%, 55%)"} 
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cash Runway Timeline */}
            <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                <h3 className="text-white font-semibold">Cash Runway Timeline</h3>
              </div>
              
              <div className="flex gap-1">
                {burnProjection.map((data, i) => {
                  const percentage = (data.cumulative / cashOnHand) * 100;
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-24 bg-[hsl(240,7%,18%)] rounded-lg overflow-hidden flex flex-col-reverse">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${percentage}%` }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className={`w-full ${
                            percentage > 50 
                              ? 'bg-gradient-to-t from-[hsl(152,100%,45%)] to-[hsl(152,100%,55%)]'
                              : percentage > 25
                                ? 'bg-gradient-to-t from-[hsl(45,90%,50%)] to-[hsl(45,90%,60%)]'
                                : 'bg-gradient-to-t from-[hsl(0,70%,50%)] to-[hsl(0,70%,60%)]'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-[hsl(220,10%,50%)]">{data.month}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(152,100%,50%)]" />
                  <span className="text-[hsl(220,10%,55%)]">Healthy (&gt;50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(45,90%,55%)]" />
                  <span className="text-[hsl(220,10%,55%)]">Caution (25-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(0,70%,55%)]" />
                  <span className="text-[hsl(220,10%,55%)]">Critical (&lt;25%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 flex justify-end">
          <Button
            onClick={onClose}
            className="px-8 bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(35,100%,50%)] hover:from-[hsl(45,90%,60%)] hover:to-[hsl(35,100%,55%)] text-white font-semibold"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

