import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle,
  Link2,
  PieChart,
  Rocket,
  Sparkles,
  Target,
  Zap,
  ArrowRight,
  ArrowDown,
  Gauge,
  Activity,
  TrendingUp,
  Clock,
  Wallet
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
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie
} from "recharts";
import { useHiring, HireRole as ContextHireRole } from "@/contexts/HiringContext";

interface HiringPlannerProps {
  initialData?: {
    monthly_burn?: number;
    cash_on_hand?: number;
    runway_months?: number;
  };
  onClose: () => void;
}

// Local interface with icon (context doesn't store icons)
interface HireRoleWithIcon extends ContextHireRole {
  icon: typeof Users;
}

const ROLE_ICONS: Record<string, typeof Users> = {
  eng: Code,
  sales: Megaphone,
  support: HeadphonesIcon,
  ops: Briefcase,
};

export function HiringPlanner({ initialData, onClose }: HiringPlannerProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // SHARED HIRING CONTEXT - Data bridge to RunwaySimulator
  // ═══════════════════════════════════════════════════════════════════════════
  const { 
    roles: contextRoles, 
    updateRole: updateContextRole,
    totalNewHires,
    hiringImpact 
  } = useHiring();
  
  const [currentBurn, setCurrentBurn] = useState(initialData?.monthly_burn || 45000);
  const [cashOnHand, setCashOnHand] = useState(initialData?.cash_on_hand || 500000);
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [animatedBurn, setAnimatedBurn] = useState(currentBurn);
  const [animatedCash, setAnimatedCash] = useState(cashOnHand);
  
  // Combine context roles with icons for display
  const roles: HireRoleWithIcon[] = useMemo(() => {
    return contextRoles.map(role => ({
      ...role,
      icon: ROLE_ICONS[role.id] || Users,
    }));
  }, [contextRoles]);

  // Calculate projections
  const [burnProjection, setBurnProjection] = useState<{ month: string; burn: number; cumulative: number; additionalBurn: number }[]>([]);
  const [currentRunway, setCurrentRunway] = useState(0);
  const [projectedRunway, setProjectedRunway] = useState(0);

  useEffect(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    const projection: { month: string; burn: number; cumulative: number; additionalBurn: number }[] = [];
    let cumulativeCash = cashOnHand;
    let runwayHit = false;
    let runwayMonth = projectionMonths;
    
    for (let i = 0; i < projectionMonths; i++) {
      const monthIndex = (currentMonth + i) % 12;
      
      // Calculate additional burn from new hires this month (time-aware)
      const additionalBurn = roles.reduce((sum, role) => {
        if (i + 1 >= role.startMonth && role.count > 0) {
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
        cumulative: Math.max(0, cumulativeCash),
        additionalBurn
      });
    }
    
    setBurnProjection(projection);
    setCurrentRunway(currentBurn > 0 ? cashOnHand / currentBurn : 0);
    setProjectedRunway(runwayMonth);
  }, [currentBurn, cashOnHand, roles, projectionMonths]);

  // Animate burn and cash counters
  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const burnStep = (currentBurn - animatedBurn) / steps;
    const cashStep = (cashOnHand - animatedCash) / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimatedBurn(prev => prev + burnStep);
      setAnimatedCash(prev => prev + cashStep);
      if (step >= steps) {
        clearInterval(interval);
        setAnimatedBurn(currentBurn);
        setAnimatedCash(cashOnHand);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [currentBurn, cashOnHand]);

  // Update role in shared context (bridges to RunwaySimulator)
  const updateRole = (id: string, field: keyof ContextHireRole, value: number) => {
    updateContextRole(id, { [field]: value });
  };

  // These now come from the shared context
  const totalAdditionalBurn = hiringImpact.totalMonthlyIncrease;
  const runwayImpact = currentRunway - projectedRunway;
  
  // Team Composition Data for Pie Chart
  const teamCompositionData = useMemo(() => {
    return roles
      .filter(role => role.count > 0)
      .map(role => ({
        name: role.title,
        value: role.count,
        color: role.color,
        salary: role.salary * role.count
      }));
  }, [roles]);
  
  // Hiring Schedule Timeline Data
  const hiringScheduleData = useMemo(() => {
    const schedule: { month: number; hires: { role: string; count: number; color: string }[] }[] = [];
    for (let month = 1; month <= 24; month++) {
      const monthHires = roles
        .filter(role => role.startMonth === month && role.count > 0)
        .map(role => ({
          role: role.title,
          count: role.count,
          color: role.color
        }));
      if (monthHires.length > 0) {
        schedule.push({ month, hires: monthHires });
      }
    }
    return schedule;
  }, [roles]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Custom tooltip for burn chart
  const BurnTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="p-4 rounded-xl bg-[hsl(240,7%,10%)] border border-white/10 shadow-xl min-w-[220px]">
        <p className="text-white font-semibold mb-3">{label}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">Total Burn:</span>
            <span className="text-[hsl(0,70%,55%)] font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
              {formatCurrency(data.burn)}
            </span>
          </div>
          {data.additionalBurn > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-[hsl(220,10%,55%)]">Hiring Cost:</span>
              <span className="text-[hsl(45,90%,55%)] font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>
                +{formatCurrency(data.additionalBurn)}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-4 pt-2 border-t border-white/10">
            <span className="text-[hsl(220,10%,55%)]">Remaining Cash:</span>
            <span className={`font-bold ${data.cumulative > cashOnHand * 0.5 ? "text-[hsl(152,100%,50%)]" : data.cumulative > cashOnHand * 0.25 ? "text-[hsl(45,90%,55%)]" : "text-[hsl(0,70%,55%)]"}`} style={{ fontFamily: 'JetBrains Mono' }}>
              {formatCurrency(data.cumulative)}
            </span>
          </div>
        </div>
      </div>
    );
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
        initial={{ scale: 0.95, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-[hsl(45,90%,55%)/0.2] shadow-2xl shadow-[hsl(45,90%,55%)/0.1]"
      >
        {/* ═══════════════════════════════════════════════════════════════════
            CINEMATIC HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative p-8 pb-4 overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(45,90%,55%)/0.15] via-transparent to-[hsl(226,100%,59%)/0.1]" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[200px] bg-[hsl(45,90%,55%)/0.2] blur-[100px] rounded-full" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[180px] bg-[hsl(152,100%,50%)/0.15] blur-[90px] rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(45,90%,55%)] via-[hsl(40,95%,50%)] to-[hsl(35,100%,50%)] flex items-center justify-center shadow-xl shadow-[hsl(45,90%,55%)/0.4]"
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white">Hiring Planner</h2>
                  {totalNewHires > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(152,100%,50%)/0.15] border border-[hsl(152,100%,50%)/0.3]"
                    >
                      <Link2 className="w-3.5 h-3.5 text-[hsl(152,100%,50%)]" />
                      <span className="text-xs font-semibold text-[hsl(152,100%,50%)]">
                        Linked to Simulator
                      </span>
                    </motion.div>
                  )}
                </div>
                <p className="text-[hsl(220,10%,55%)] mt-1">
                  {totalNewHires > 0 
                    ? `${totalNewHires} hire${totalNewHires > 1 ? 's' : ''} synced → Runway Simulator receives this data`
                    : "Plan team growth and see burn rate impact in real-time"
                  }
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
              {/* Current Financials */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(45,90%,55%)/0.2] flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                  </div>
                  <h3 className="text-white font-semibold">Current Financials</h3>
                </div>
                
                <div className="space-y-5">
                  {/* Monthly Burn */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                        Monthly Burn
                      </Label>
                      <span className="text-xs text-[hsl(220,10%,45%)]">Base</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] text-sm">$</span>
                      <Input
                        type="number"
                        value={currentBurn}
                        onChange={(e) => setCurrentBurn(Math.max(0, Number(e.target.value)))}
                        className="pl-8 h-11 bg-[hsl(240,7%,8%)] border-white/10 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Cash on Hand */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">
                        Cash on Hand
                      </Label>
                      <span className="text-xs text-[hsl(220,10%,45%)]">Total</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] text-sm">$</span>
                      <Input
                        type="number"
                        value={cashOnHand}
                        onChange={(e) => setCashOnHand(Math.max(0, Number(e.target.value)))}
                        className="pl-8 h-11 bg-[hsl(240,7%,8%)] border-white/10 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hire Roles */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(152,100%,50%)/0.2] flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                  </div>
                  <h3 className="text-white font-semibold">Plan New Hires</h3>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {roles.map((role, index) => (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        {/* Role Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                            style={{ background: `${role.color}20` }}
                          >
                            <role.icon className="w-5 h-5" style={{ color: role.color }} />
                          </div>
                          <div className="flex-1">
                            <span className="text-white font-semibold text-sm">{role.title}</span>
                            {role.count > 0 && (
                              <p className="text-xs text-[hsl(220,10%,50%)]">
                                {role.count} hire{role.count > 1 ? 's' : ''} • ${formatCurrency(role.salary * role.count)}/mo
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="space-y-4 mb-3">
                          {/* Salary Slider with Custom Input */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-[hsl(220,10%,50%)] text-[10px] uppercase">Salary/mo</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)] text-[10px]">$</span>
                                <Input
                                  type="number"
                                  value={role.salary}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value) || 0);
                                    updateRole(role.id, "salary", val);
                                  }}
                                  className="h-6 w-20 pl-5 pr-2 text-xs bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono focus:border-[hsl(45,90%,55%)]/50"
                                  min={0}
                                  step={1000}
                                />
                              </div>
                            </div>
                            <Slider
                              value={[Math.min(role.salary, 50000)]}
                              onValueChange={(value) => updateRole(role.id, "salary", value[0])}
                              min={3000}
                              max={50000}
                              step={1000}
                              className="[&>span:first-child]:h-1.5 [&>span:first-child]:bg-[hsl(240,7%,20%)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                            />
                            <div className="flex justify-between text-[9px] text-[hsl(220,10%,40%)] mt-1">
                              <span>$3K</span>
                              <span>$25K</span>
                              <span className="flex items-center gap-1">
                                $50K
                                {role.salary > 50000 && (
                                  <span className="text-[hsl(45,90%,55%)]">+</span>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          {/* Count Slider with Custom Input */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-[hsl(220,10%,50%)] text-[10px] uppercase"># Hires</Label>
                              <Input
                                type="number"
                                value={role.count}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value) || 0);
                                  updateRole(role.id, "count", val);
                                }}
                                className="h-6 w-16 text-xs bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono text-center focus:border-[hsl(45,90%,55%)]/50"
                                min={0}
                                step={1}
                              />
                            </div>
                            <Slider
                              value={[Math.min(role.count, 20)]}
                              onValueChange={(value) => updateRole(role.id, "count", value[0])}
                              min={0}
                              max={20}
                              step={1}
                              className="[&>span:first-child]:h-1.5 [&>span:first-child]:bg-[hsl(240,7%,20%)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                            />
                            <div className="flex justify-between text-[9px] text-[hsl(220,10%,40%)] mt-1">
                              <span>0</span>
                              <span>10</span>
                              <span className="flex items-center gap-1">
                                20
                                {role.count > 20 && (
                                  <span className="text-[hsl(45,90%,55%)]">+</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Start Month Slider (only if hires > 0) */}
                        {role.count > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 border-t border-white/5">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-[hsl(220,10%,50%)] text-[10px] uppercase">Start Month</Label>
                                <span className="text-xs text-[hsl(45,90%,55%)] font-mono font-semibold">
                                  M{role.startMonth} {role.startMonth === 1 ? "(Now)" : `(+${role.startMonth - 1}mo)`}
                                </span>
                              </div>
                              <Slider
                                value={[role.startMonth]}
                                onValueChange={(value) => updateRole(role.id, "startMonth", value[0])}
                                min={1}
                                max={24}
                                step={1}
                                className="mb-2 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-[hsl(240,7%,20%)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                              />
                              <div className="flex justify-between text-[9px] text-[hsl(220,10%,40%)]">
                                <span>Now</span>
                                <span>+12mo</span>
                                <span>+24mo</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Runway Impact Summary */}
              {totalNewHires > 0 && (
                <div className={`p-5 rounded-2xl border ${
                  runwayImpact >= -3
                    ? 'bg-gradient-to-br from-[hsl(152,100%,50%)/0.1] to-transparent border-[hsl(152,100%,50%)/0.3]'
                    : runwayImpact >= -6
                      ? 'bg-gradient-to-br from-[hsl(45,90%,55%)/0.1] to-transparent border-[hsl(45,90%,55%)/0.3]'
                      : 'bg-gradient-to-br from-[hsl(0,70%,55%)/0.1] to-transparent border-[hsl(0,70%,55%)/0.3]'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {runwayImpact >= -3 ? (
                      <CheckCircle className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                    ) : runwayImpact >= -6 ? (
                      <AlertTriangle className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[hsl(0,70%,55%)]" />
                    )}
                    <span className={`text-sm font-semibold ${
                      runwayImpact >= -3 ? "text-[hsl(152,100%,50%)]" : runwayImpact >= -6 ? "text-[hsl(45,90%,55%)]" : "text-[hsl(0,70%,55%)]"
                    }`}>
                      {runwayImpact >= -3 
                        ? "Minimal Impact" 
                        : runwayImpact >= -6
                          ? "Moderate Impact"
                          : "High Impact"
                      }
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(220,10%,55%)]">
                    {totalNewHires} hire{totalNewHires > 1 ? 's' : ''} adding {formatCurrency(totalAdditionalBurn)}/mo will reduce runway by {Math.abs(runwayImpact).toFixed(1)} months
                  </p>
                </div>
              )}
            </motion.div>

            {/* ═══ RIGHT PANEL: VISUALIZATIONS ═══ */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* Burn Rate Projection Chart */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(45,90%,55%)/0.2] flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Monthly Burn Projection</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Time-aware hiring impact</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(45,90%,55%)/0.1] border border-[hsl(45,90%,55%)/0.3]">
                    <Activity className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                    <span className="text-xs text-[hsl(45,90%,55%)] font-semibold">12 Months</span>
                  </div>
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={burnProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(45, 90%, 55%)" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="hsl(45, 90%, 55%)" stopOpacity={0} />
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
                      <Tooltip content={<BurnTooltip />} />
                      <ReferenceLine 
                        y={currentBurn} 
                        stroke="hsl(226, 100%, 59%)" 
                        strokeDasharray="4 4" 
                        strokeWidth={2}
                        label={{ value: "Current Burn", position: "right", fill: "hsl(226,100%,68%)", fontSize: 11 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="burn"
                        stroke="hsl(45, 90%, 55%)"
                        strokeWidth={2}
                        fill="url(#burnGradient)"
                      />
                      <Bar dataKey="additionalBurn" radius={[2, 2, 0, 0]} fill="hsl(0, 70%, 55%)" fillOpacity={0.7}>
                        {burnProjection.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.additionalBurn > 0 ? "hsl(0, 70%, 55%)" : "transparent"}
                          />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex items-center justify-between mt-4 text-xs text-[hsl(220,10%,50%)]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[hsl(45,90%,55%)]" />
                      <span>Total Burn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[hsl(0,70%,55%)]" />
                      <span>Hiring Cost</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-1 border-t-2 border-dashed border-[hsl(226,100%,59%)]" />
                      <span>Current Baseline</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Composition Breakdown */}
              {totalNewHires > 0 && (
                <div className="p-6 rounded-2xl glass-panel border border-white/5 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.2] flex items-center justify-center">
                        <PieChart className="w-5 h-5 text-[hsl(226,100%,68%)]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Team Composition</h3>
                        <p className="text-xs text-[hsl(220,10%,50%)]">Breakdown by role</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={teamCompositionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {teamCompositionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const data = payload[0].payload;
                              return (
                                <div className="p-3 rounded-lg bg-[hsl(240,7%,10%)] border border-white/10 shadow-xl">
                                  <p className="text-white font-semibold mb-2">{data.name}</p>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between gap-4">
                                      <span className="text-[hsl(220,10%,55%)]">Hires:</span>
                                      <span className="text-white font-bold">{data.value}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-[hsl(220,10%,55%)]">Monthly Cost:</span>
                                      <span className="text-white font-bold font-mono">{formatCurrency(data.salary)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-col justify-center gap-4">
                      {teamCompositionData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(240,7%,12%)] border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                            <span className="text-white font-medium">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{item.value} hire{item.value > 1 ? 's' : ''}</p>
                            <p className="text-xs text-[hsl(220,10%,55%)]">{formatCurrency(item.salary)}/mo</p>
                          </div>
                        </div>
                      ))}
                      {totalNewHires > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[hsl(220,10%,55%)]">Total Hires:</span>
                            <span className="text-lg font-bold text-white">{totalNewHires}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-[hsl(220,10%,55%)]">Total Monthly Cost:</span>
                            <span className="text-lg font-bold text-[hsl(0,70%,55%)] font-mono">{formatCurrency(totalAdditionalBurn)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Hiring Schedule Timeline */}
              {hiringScheduleData.length > 0 && (
                <div className="p-6 rounded-2xl glass-panel border border-white/5 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(45,90%,55%)/0.2] flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Hiring Schedule</h3>
                        <p className="text-xs text-[hsl(220,10%,50%)]">When hires start over next 24 months</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {hiringScheduleData.map((scheduleItem, index) => (
                      <motion.div
                        key={scheduleItem.month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[hsl(45,90%,55%)/0.2] flex items-center justify-center border border-[hsl(45,90%,55%)/0.3]">
                              <span className="text-sm font-bold text-[hsl(45,90%,55%)]">M{scheduleItem.month}</span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {scheduleItem.month === 1 ? 'Starting Now' : `Month ${scheduleItem.month} (+${scheduleItem.month - 1}mo)`}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {scheduleItem.hires.map((hire, hireIndex) => (
                            <div
                              key={hireIndex}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              style={{ backgroundColor: `${hire.color}20`, border: `1px solid ${hire.color}40` }}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hire.color }} />
                              <span className="text-sm font-semibold text-white">{hire.role}</span>
                              <span className="text-xs text-[hsl(220,10%,60%)]">×{hire.count}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cash Runway Timeline */}
              <div className="p-6 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(152,100%,50%)/0.2] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Cash Runway Timeline</h3>
                      <p className="text-xs text-[hsl(220,10%,50%)]">Remaining cash by month</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <AnimatePresence>
                    {burnProjection.map((data, i) => {
                      const percentage = (data.cumulative / cashOnHand) * 100;
                      return (
                        <motion.div
                          key={data.month}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div className="w-full h-40 bg-[hsl(240,7%,18%)] rounded-xl overflow-hidden flex flex-col-reverse border border-white/5">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(0, Math.min(100, percentage))}%` }}
                              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                              className={`w-full rounded-t-xl ${
                                percentage > 50 
                                  ? 'bg-gradient-to-t from-[hsl(152,100%,45%)] to-[hsl(152,100%,55%)]'
                                  : percentage > 25
                                    ? 'bg-gradient-to-t from-[hsl(45,90%,50%)] to-[hsl(45,90%,60%)]'
                                    : 'bg-gradient-to-t from-[hsl(0,70%,50%)] to-[hsl(0,70%,60%)]'
                              }`}
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-white mb-0.5">{data.month}</p>
                            <p className="text-[10px] text-[hsl(220,10%,50%)] font-mono">
                              {formatCurrency(data.cumulative)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-sm">
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
            </motion.div>
          </div>

          {/* ═══ FOOTER ACTIONS ═══ */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 pt-0 flex justify-end"
          >
            <Button
              onClick={onClose}
              className="px-8 bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(35,100%,50%)] hover:from-[hsl(45,90%,60%)] hover:to-[hsl(35,100%,55%)] text-white font-semibold shadow-lg shadow-[hsl(45,90%,55%)/0.3]"
            >
              Done
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
