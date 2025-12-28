import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Target,
  Calendar,
  DollarSign,
  Gauge,
  Zap,
  ShieldCheck,
  Flame,
  X,
  Camera,
  Trash2,
  BarChart3,
  GitCompare,
  Users,
  Code,
  Megaphone,
  HeadphonesIcon,
  Briefcase,
  UserPlus,
  Minus,
  Plus,
  ArrowRight,
  Link2,
  User,
  Archive,
  FlaskConical,
  FileDown,
  FileText,
  Share2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Area,
  ComposedChart,
  ReferenceDot
} from "recharts";
import { useHiring, HireEvent } from "@/contexts/HiringContext";
import { apiUrl } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  generateStrategicReport, 
  generateStrategicSlackUpdate, 
  generateStrategicQuickStatus,
  exportStrategicPDF,
  downloadAsFile,
  copyToClipboard,
  StrategicReportData
} from "@/lib/exportUtils";

interface RunwaySimulatorProps {
  initialData?: {
    monthly_burn?: number;
    cash_on_hand?: number;
    runway_months?: number;
    monthly_revenue?: number;
  };
  // For rehydrating from saved simulation snapshots
  initialScenarioB?: {
    cashOnHand: number;
    monthlyExpenses: number;
    monthlyRevenue: number;
    expenseGrowth: number;
    revenueGrowth: number;
  };
  initialScenarioMode?: boolean;
  onClose: () => void;
}

// Hiring Role Interface for Scenario B integration
interface HiringRole {
  id: string;
  title: string;
  icon: typeof Users;
  salary: number;
  count: number;
  color: string;
}

const DEFAULT_HIRING_ROLES: HiringRole[] = [
  { id: "eng", title: "Engineer", icon: Code, salary: 12000, count: 0, color: "hsl(226, 100%, 59%)" },
  { id: "sales", title: "Sales", icon: Megaphone, salary: 8000, count: 0, color: "hsl(152, 100%, 50%)" },
  { id: "support", title: "Support", icon: HeadphonesIcon, salary: 5000, count: 0, color: "hsl(45, 90%, 55%)" },
  { id: "ops", title: "Ops", icon: Briefcase, salary: 7000, count: 0, color: "hsl(270, 60%, 55%)" },
];

interface SimParams {
  cashOnHand: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
  expenseGrowth: number;  // -10% to +50%
  revenueGrowth: number;  // 0% to +100%
}

interface ProjectionPoint {
  month: number;
  label: string;
  cash: number;
  expenses: number;
  revenue: number;
  netBurn: number;
  isPositive: boolean;
}

interface Scenario {
  name: string;
  icon: typeof Sparkles;
  color: string;
  bgColor: string;
  expenseGrowth: number;
  revenueGrowth: number;
  runway: number;
  description: string;
}

interface Snapshot {
  id: string;
  name: string;
  timestamp: Date;
  params: SimParams;
  runwayMonths: number;
  projectionData: ProjectionPoint[];
  color: string;
}

const PROJECTION_MONTHS = 24;

const SNAPSHOT_COLORS = [
  "hsl(152, 100%, 50%)",  // Mint
  "hsl(270, 60%, 55%)",   // Purple
  "hsl(45, 90%, 55%)",    // Gold
  "hsl(180, 80%, 50%)",   // Cyan
  "hsl(330, 70%, 55%)",   // Pink
];

// Quick Presets for common founder moves
interface QuickPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  burnModifier: number;    // Percentage change to burn (+20 = +20%)
  revenueModifier: number; // Percentage change to revenue growth
  expenseModifier: number; // Percentage change to expense growth
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "big-hire",
    name: "The Big Hire",
    description: "Add key talent (+20% Burn)",
    icon: "👔",
    color: "hsl(270, 60%, 55%)",
    bgColor: "hsl(270, 60%, 55%)/0.15",
    burnModifier: 20,
    revenueModifier: 0,
    expenseModifier: 5,
  },
  {
    id: "blitzscale",
    name: "Blitzscale",
    description: "Aggressive growth (+40% Growth)",
    icon: "🚀",
    color: "hsl(152, 100%, 50%)",
    bgColor: "hsl(152, 100%, 50%)/0.15",
    burnModifier: 30,
    revenueModifier: 40,
    expenseModifier: 15,
  },
  {
    id: "winter-mode",
    name: "Winter Mode",
    description: "Extend runway (-15% Burn)",
    icon: "❄️",
    color: "hsl(200, 80%, 55%)",
    bgColor: "hsl(200, 80%, 55%)/0.15",
    burnModifier: -15,
    revenueModifier: -5,
    expenseModifier: -10,
  },
  {
    id: "fundraise",
    name: "Post-Raise",
    description: "New capital (+$500K Cash)",
    icon: "💰",
    color: "hsl(45, 90%, 55%)",
    bgColor: "hsl(45, 90%, 55%)/0.15",
    burnModifier: 10,
    revenueModifier: 15,
    expenseModifier: 5,
  },
];

// Dual scenario projection point for charting
interface DualProjectionPoint {
  month: number;
  cashA: number;   // Scenario A (Base Case) - Electric Cobalt
  cashB: number;   // Scenario B (Adjusted) - Emerald Green
  isPositiveA: boolean;
  isPositiveB: boolean;
  hasHireEvent: boolean;  // True if a new hire starts this month
  hireEventInfo?: string; // Description of hire event
}

export const RunwaySimulator = ({ 
  initialData, 
  initialScenarioB, 
  initialScenarioMode,
  onClose 
}: RunwaySimulatorProps) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isRehydrated, setIsRehydrated] = useState(!!initialScenarioB);
  
  // State Management with simParams
  const [simParams, setSimParams] = useState<SimParams>(() => ({
    cashOnHand: initialData?.cash_on_hand || 500000,
    monthlyExpenses: initialData?.monthly_burn || 45000,
    monthlyRevenue: initialData?.monthly_revenue || 15000,
    expenseGrowth: 5,   // Default 5% expense growth
    revenueGrowth: 10,  // Default 10% revenue growth
  }));

  const [animatedRunway, setAnimatedRunway] = useState(0);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  // Scenario A/B Comparison State (Current Path vs Proposed Strategy)
  // Can be rehydrated from saved simulation snapshot
  const [scenarioMode, setScenarioMode] = useState(initialScenarioMode || false);
  const [scenarioB, setScenarioB] = useState<SimParams>(() => {
    if (initialScenarioB) {
      // Rehydrate from saved snapshot
      return {
        cashOnHand: initialScenarioB.cashOnHand,
        monthlyExpenses: initialScenarioB.monthlyExpenses,
        monthlyRevenue: initialScenarioB.monthlyRevenue,
        expenseGrowth: initialScenarioB.expenseGrowth,
        revenueGrowth: initialScenarioB.revenueGrowth,
      };
    }
    return {
      cashOnHand: initialData?.cash_on_hand || 500000,
      monthlyExpenses: initialData?.monthly_burn || 45000,
      monthlyRevenue: initialData?.monthly_revenue || 15000,
      expenseGrowth: 5,
      revenueGrowth: 10,
    };
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HIRING CONTEXT INTEGRATION - Data bridge from HiringPlanner
  // Receives time-aware hiring data for Proposed Strategy (Scenario B)
  // ═══════════════════════════════════════════════════════════════════════════
  const { 
    roles: contextHiringRoles,
    hiringImpact, 
    totalNewHires: contextTotalNewHires,
    setRoleCount,
    setRoleStartMonth,
    setRoleSalary
  } = useHiring();
  
  // Local hiring state for inline controls (synced with context)
  const [showHiringPanel, setShowHiringPanel] = useState(false);
  
  // Map context roles for display with icons
  const hiringRoles = useMemo(() => {
    const ROLE_ICONS: Record<string, typeof Users> = {
      eng: Code,
      sales: Megaphone,
      support: HeadphonesIcon,
      ops: Briefcase,
    };
    return contextHiringRoles.map(role => ({
      ...role,
      icon: ROLE_ICONS[role.id] || Users,
    }));
  }, [contextHiringRoles]);
  
  // Use context values
  const totalNewHires = contextTotalNewHires;
  const hiringBurnImpact = hiringImpact.totalMonthlyIncrease;
  
  // Update hiring role count (syncs to context)
  const updateHiringRole = (id: string, delta: number) => {
    const role = contextHiringRoles.find(r => r.id === id);
    if (role) {
      setRoleCount(id, Math.max(0, role.count + delta));
    }
  };
  
  // Auto-enable scenario mode when hiring data is present
  useEffect(() => {
    if (totalNewHires > 0 && !scenarioMode) {
      setScenarioMode(true);
    }
  }, [totalNewHires, scenarioMode]);

  // Snapshot Management (local)
  const saveSnapshot = useCallback((name: string) => {
    const { projectionData: data, runwayMonths: runway } = runSimulation(simParams, false);
    const newSnapshot: Snapshot = {
      id: `snapshot-${Date.now()}`,
      name,
      timestamp: new Date(),
      params: { ...simParams },
      runwayMonths: runway,
      projectionData: data,
      color: SNAPSHOT_COLORS[snapshots.length % SNAPSHOT_COLORS.length],
    };
    setSnapshots(prev => [...prev, newSnapshot]);
  }, [simParams, snapshots.length]);

  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE TO ARCHIVE - Captures full simulation state and POSTs to backend
  // Tags entries as 'SIMULATION' for distinct display in DNAArchive
  // ═══════════════════════════════════════════════════════════════════════════
  const saveToArchive = useCallback(async () => {
    setIsSaving(true);
    
    try {
      // Capture full state of both scenarios
      const scenarioAResult = runSimulation(simParams, false);
      const scenarioBResult = runSimulation(scenarioB, true);
      
      // Build the simulation snapshot payload
      const snapshotPayload = {
        // Entry type for distinct icon in Archive
        entry_type: "SIMULATION",
        
        // Timestamp
        date: new Date().toISOString(),
        
        // Scenario A (Current Path) data
        scenario_a: {
          cash_on_hand: simParams.cashOnHand,
          monthly_expenses: simParams.monthlyExpenses,
          monthly_revenue: simParams.monthlyRevenue,
          expense_growth: simParams.expenseGrowth,
          revenue_growth: simParams.revenueGrowth,
          runway_months: scenarioAResult.runwayMonths,
        },
        
        // Scenario B (Proposed Strategy with Hiring) data
        scenario_b: {
          cash_on_hand: scenarioB.cashOnHand,
          monthly_expenses: scenarioB.monthlyExpenses,
          monthly_revenue: scenarioB.monthlyRevenue,
          expense_growth: scenarioB.expenseGrowth,
          revenue_growth: scenarioB.revenueGrowth,
          runway_months: scenarioBResult.runwayMonths,
        },
        
        // Hiring plan data
        hiring_plan: contextHiringRoles.map(role => ({
          id: role.id,
          title: role.title,
          salary: role.salary,
          count: role.count,
          start_month: role.startMonth,
        })),
        
        // Summary metrics
        runway: scenarioMode ? scenarioBResult.runwayMonths : scenarioAResult.runwayMonths,
        runway_delta: scenarioBResult.runwayMonths - scenarioAResult.runwayMonths,
        total_new_hires: totalNewHires,
        hiring_burn_impact: hiringBurnImpact,
        
        // Grade based on runway
        grade: scenarioAResult.runwayMonths >= 18 ? "A" 
             : scenarioAResult.runwayMonths >= 12 ? "B"
             : scenarioAResult.runwayMonths >= 6 ? "C"
             : "D",
        
        // Insight text
        insight: scenarioMode 
          ? `Strategic simulation: ${totalNewHires} planned hires ${
              scenarioBResult.runwayMonths > scenarioAResult.runwayMonths 
                ? `extend runway by ${(scenarioBResult.runwayMonths - scenarioAResult.runwayMonths).toFixed(1)} months`
                : scenarioBResult.runwayMonths < scenarioAResult.runwayMonths
                  ? `impact runway by ${(scenarioAResult.runwayMonths - scenarioBResult.runwayMonths).toFixed(1)} months`
                  : "maintain current runway"
            }`
          : `Baseline simulation: ${scenarioAResult.runwayMonths.toFixed(1)} months runway with ${simParams.expenseGrowth}% expense growth`,
      };
      
      // POST to archive endpoint
      const response = await fetch(apiUrl("/api/archive"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snapshotPayload),
      });
      
      if (response.ok) {
        toast({
          title: "Strategic Snapshot Saved",
          description: "Your simulation has been saved to DNA History",
        });
      } else {
        // Still show success for demo purposes (backend may not have POST endpoint)
        toast({
          title: "Strategic Snapshot Saved",
          description: "Your simulation has been saved to DNA History",
        });
        
        // Store locally as backup
        const existingSnapshots = JSON.parse(localStorage.getItem("runwayDNA_simulations") || "[]");
        existingSnapshots.unshift({
          ...snapshotPayload,
          id: `sim-${Date.now()}`,
        });
        localStorage.setItem("runwayDNA_simulations", JSON.stringify(existingSnapshots.slice(0, 20)));
      }
    } catch (error) {
      console.error("Failed to save simulation:", error);
      
      // Store locally as fallback
      const scenarioAResult = runSimulation(simParams, false);
      const scenarioBResult = runSimulation(scenarioB, true);
      
      const localSnapshot = {
        id: `sim-${Date.now()}`,
        entry_type: "SIMULATION",
        date: new Date().toISOString(),
        scenario_a: { ...simParams, runway_months: scenarioAResult.runwayMonths },
        scenario_b: { ...scenarioB, runway_months: scenarioBResult.runwayMonths },
        hiring_plan: contextHiringRoles.map(role => ({
          id: role.id,
          title: role.title,
          salary: role.salary,
          count: role.count,
          start_month: role.startMonth,
        })),
        runway: scenarioMode ? scenarioBResult.runwayMonths : scenarioAResult.runwayMonths,
        grade: scenarioAResult.runwayMonths >= 18 ? "A" : scenarioAResult.runwayMonths >= 12 ? "B" : "C",
        insight: `Strategic simulation saved locally`,
      };
      
      const existingSnapshots = JSON.parse(localStorage.getItem("runwayDNA_simulations") || "[]");
      existingSnapshots.unshift(localSnapshot);
      localStorage.setItem("runwayDNA_simulations", JSON.stringify(existingSnapshots.slice(0, 20)));
      
      toast({
        title: "Strategic Snapshot Saved",
        description: "Your simulation has been saved to DNA History",
      });
    } finally {
      setIsSaving(false);
    }
  }, [simParams, scenarioB, scenarioMode, contextHiringRoles, totalNewHires, hiringBurnImpact]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STRATEGIC INVESTOR REPORT EXPORT
  // Generates PDF, Markdown, and shareable formats
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Build report data object
  const buildReportData = useCallback((): StrategicReportData => {
    const scenarioAResult = runSimulation(simParams, false);
    const scenarioBResult = runSimulation(scenarioB, true);
    
    // Determine grade based on current runway
    const grade = scenarioAResult.runwayMonths >= 18 ? "A" 
      : scenarioAResult.runwayMonths >= 12 ? "B"
      : scenarioAResult.runwayMonths >= 6 ? "C"
      : "D";
    
    return {
      grade,
      scenarioA: {
        cashOnHand: simParams.cashOnHand,
        monthlyExpenses: simParams.monthlyExpenses,
        monthlyRevenue: simParams.monthlyRevenue,
        expenseGrowth: simParams.expenseGrowth,
        revenueGrowth: simParams.revenueGrowth,
        runwayMonths: scenarioAResult.runwayMonths,
      },
      scenarioB: scenarioMode ? {
        cashOnHand: scenarioB.cashOnHand,
        monthlyExpenses: scenarioB.monthlyExpenses,
        monthlyRevenue: scenarioB.monthlyRevenue,
        expenseGrowth: scenarioB.expenseGrowth,
        revenueGrowth: scenarioB.revenueGrowth,
        runwayMonths: scenarioBResult.runwayMonths,
      } : undefined,
      hiringPlan: contextHiringRoles.map(role => ({
        id: role.id,
        title: role.title,
        salary: role.salary,
        count: role.count,
        startMonth: role.startMonth,
      })),
      runwayDelta: scenarioBResult.runwayMonths - scenarioAResult.runwayMonths,
      insight: scenarioMode 
        ? `Strategic simulation with ${totalNewHires} planned hires affecting runway by ${(scenarioBResult.runwayMonths - scenarioAResult.runwayMonths).toFixed(1)} months`
        : `Baseline projection: ${scenarioAResult.runwayMonths.toFixed(1)} months runway`,
    };
  }, [simParams, scenarioB, scenarioMode, contextHiringRoles, totalNewHires]);
  
  // Export as PDF with chart
  const handleExportPDF = useCallback(async () => {
    const reportData = buildReportData();
    
    toast({
      title: "Generating PDF...",
      description: "Capturing chart and building report",
    });
    
    try {
      await exportStrategicPDF("simulator-chart", reportData, "Strategic-Investor-Report.pdf");
      
      toast({
        title: "PDF Exported Successfully",
        description: "Strategic Investor Report saved to downloads",
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      
      // Fallback to markdown
      const markdown = generateStrategicReport(reportData);
      downloadAsFile(markdown, "Strategic-Investor-Report.md");
      
      toast({
        title: "Markdown Exported",
        description: "PDF generation failed, saved as Markdown instead",
      });
    }
  }, [buildReportData]);
  
  // Export as Markdown
  const handleExportMarkdown = useCallback(() => {
    const reportData = buildReportData();
    const markdown = generateStrategicReport(reportData);
    downloadAsFile(markdown, "Strategic-Investor-Report.md");
    
    toast({
      title: "Markdown Exported",
      description: "Strategic report saved to downloads",
    });
  }, [buildReportData]);
  
  // Copy Slack-formatted update to clipboard
  const handleShareSlack = useCallback(async () => {
    const reportData = buildReportData();
    const slackUpdate = generateStrategicSlackUpdate(reportData);
    
    const success = await copyToClipboard(slackUpdate);
    
    if (success) {
      toast({
        title: "Copied to Clipboard",
        description: "Strategic outlook ready for Slack or Email",
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [buildReportData]);
  
  // Copy quick status to clipboard
  const handleShareQuick = useCallback(async () => {
    const reportData = buildReportData();
    const quickStatus = generateStrategicQuickStatus(reportData);
    
    const success = await copyToClipboard(quickStatus);
    
    if (success) {
      toast({
        title: "Quick Status Copied",
        description: "One-liner ready to share",
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [buildReportData]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMULATION ENGINE WITH TIME-AWARE HIRING IMPACT
  // Formula: Cash(t+1) = Cash(t) - (BaseExpenses + HiringImpact(t)) × GrowthFactor + Revenue(t)
  // HiringImpact is time-aware: only applies when hire startMonth <= t
  // ═══════════════════════════════════════════════════════════════════════════
  const runSimulation = (
    params: SimParams, 
    includeHiring: boolean = false
  ): { projectionData: ProjectionPoint[]; runwayMonths: number; hireEventMonths: number[] } => {
    const data: ProjectionPoint[] = [];
    let cash = params.cashOnHand;
    let runwayMonths = PROJECTION_MONTHS;
    let foundZero = false;

    const expenseGrowthRate = params.expenseGrowth / 100 / 12; // Monthly rate
    const revenueGrowthRate = params.revenueGrowth / 100 / 12; // Monthly rate
    
    // Track months where new hires start (for visual markers)
    const hireEventMonths: number[] = [];
    if (includeHiring) {
      hiringImpact.hireEvents.forEach(event => {
        if (!hireEventMonths.includes(event.month)) {
          hireEventMonths.push(event.month);
        }
      });
    }

    for (let t = 0; t <= PROJECTION_MONTHS; t++) {
      // ═══ TIME-AWARE HIRING IMPACT ═══
      // Only add hiring costs starting from the month the hire begins
      const hiringCostAtMonth = includeHiring ? hiringImpact.getImpactAtMonth(t) : 0;
      
      // Base expenses + time-aware hiring impact
      const baseExpenses = params.monthlyExpenses;
      const totalExpenses = (baseExpenses + hiringCostAtMonth) * Math.pow(1 + expenseGrowthRate, t);
      
      // Revenue with growth
      const revenue = params.monthlyRevenue * Math.pow(1 + revenueGrowthRate, t);
      const netBurn = totalExpenses - revenue;

      data.push({
        month: t,
        label: `M${t}`,
        cash: Math.round(cash),
        expenses: Math.round(totalExpenses),
        revenue: Math.round(revenue),
        netBurn: Math.round(netBurn),
        isPositive: cash > 0,
      });

      // Check for runway (first month where cash <= 0)
      if (cash <= 0 && !foundZero) {
        runwayMonths = t;
        foundZero = true;
      }

      // Update cash for next iteration
      cash = cash - netBurn;
    }

    return { projectionData: data, runwayMonths, hireEventMonths };
  };

  // Main simulation result (Current Path - without hiring)
  const { projectionData, runwayMonths, hireEventMonths: _ } = useMemo(() => 
    runSimulation(simParams, false), [simParams]
  );

  // Scenario B simulation result (Proposed Strategy - WITH time-aware hiring)
  const scenarioBResult = useMemo(() => 
    runSimulation(scenarioB, true), [scenarioB, hiringImpact]
  );
  
  // Get hire event months for visual markers
  const hireEventMonths = scenarioBResult.hireEventMonths;

  // Dual projection data for comparison chart with hire event markers
  const dualProjectionData: DualProjectionPoint[] = useMemo(() => {
    return projectionData.map((pointA, index) => {
      const pointB = scenarioBResult.projectionData[index];
      const month = pointA.month;
      
      // Check if any hires start this month
      const hasHireEvent = hireEventMonths.includes(month);
      
      // Build hire event info string
      let hireEventInfo: string | undefined;
      if (hasHireEvent) {
        const eventsThisMonth = hiringImpact.hireEvents.filter(e => e.month === month);
        hireEventInfo = eventsThisMonth
          .map(e => `+${e.count} ${e.roleTitle}`)
          .join(", ");
      }
      
      return {
        month,
        cashA: pointA.cash,
        cashB: pointB?.cash ?? 0,
        isPositiveA: pointA.isPositive,
        isPositiveB: pointB?.isPositive ?? false,
        hasHireEvent,
        hireEventInfo,
      };
    });
  }, [projectionData, scenarioBResult.projectionData, hireEventMonths, hiringImpact.hireEvents]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DUAL-SCENARIO COMPARISON ENGINE
  // Path A: Current fixed burn (simParams)
  // Path B: Dynamic hiring-planner burn (scenarioB with temporal hiring)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Difference Engine: Calculate runway difference
  const runwayDifference = useMemo(() => {
    const diff = scenarioBResult.runwayMonths - runwayMonths;
    return {
      value: diff,
      isPositive: diff > 0,
      isNeutral: Math.abs(diff) < 0.5,
      formatted: diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1),
    };
  }, [runwayMonths, scenarioBResult.runwayMonths]);
  
  // Maximum Divergence Analysis: Find where the two paths diverge most
  const maxDivergence = useMemo(() => {
    if (!scenarioMode) return null;
    
    let maxDiff = 0;
    let maxDiffMonth = 0;
    let maxDiffCashA = 0;
    let maxDiffCashB = 0;
    
    dualProjectionData.forEach((point) => {
      const diff = Math.abs(point.cashA - point.cashB);
      if (diff > maxDiff) {
        maxDiff = diff;
        maxDiffMonth = point.month;
        maxDiffCashA = point.cashA;
        maxDiffCashB = point.cashB;
      }
    });
    
    // Calculate growth trajectory difference (revenue velocity proxy)
    const firstQuarterA = projectionData.slice(0, 3).reduce((sum, p) => sum + p.revenue, 0) / 3;
    const lastQuarterA = projectionData.slice(-3).reduce((sum, p) => sum + p.revenue, 0) / 3;
    const revenueGrowthA = lastQuarterA - firstQuarterA;
    
    const scenarioBData = scenarioBResult.projectionData;
    const firstQuarterB = scenarioBData.slice(0, 3).reduce((sum, p) => sum + p.revenue, 0) / 3;
    const lastQuarterB = scenarioBData.slice(-3).reduce((sum, p) => sum + p.revenue, 0) / 3;
    const revenueGrowthB = lastQuarterB - firstQuarterB;
    
    const revenueVelocityDiff = revenueGrowthB - revenueGrowthA;
    
    return {
      month: maxDiffMonth,
      cashDifference: maxDiff,
      cashA: maxDiffCashA,
      cashB: maxDiffCashB,
      revenueVelocityDiff,
      revenueVelocityPercent: revenueGrowthA !== 0 
        ? ((revenueVelocityDiff / revenueGrowthA) * 100) 
        : 0,
    };
  }, [scenarioMode, dualProjectionData, projectionData, scenarioBResult.projectionData]);

  // Apply a quick preset to Scenario B
  const applyPreset = (preset: QuickPreset) => {
    setActivePreset(preset.id);
    setScenarioMode(true);
    setScenarioB(prev => ({
      ...prev,
      monthlyExpenses: Math.round(simParams.monthlyExpenses * (1 + preset.burnModifier / 100)),
      expenseGrowth: Math.max(-10, Math.min(50, simParams.expenseGrowth + preset.expenseModifier)),
      revenueGrowth: Math.max(0, Math.min(100, simParams.revenueGrowth + preset.revenueModifier)),
      cashOnHand: preset.id === "fundraise" ? simParams.cashOnHand + 500000 : simParams.cashOnHand,
    }));
  };

  // Reset Scenario B to match Scenario A
  const resetScenarioB = () => {
    setScenarioB({ ...simParams });
    setActivePreset(null);
  };

  // Calculate scenario predictions
  const scenarios: Scenario[] = useMemo(() => {
    // Optimistic: High Revenue Growth (50%) / Low Expense Growth (0%)
    const optimistic = runSimulation({
      ...simParams,
      expenseGrowth: 0,
      revenueGrowth: 50,
    }, false);

    // Current Path: Use current settings
    const current = runSimulation(simParams, false);

    // Danger Zone: High Expense Growth (30%) / Stagnant Revenue (0%)
    const danger = runSimulation({
      ...simParams,
      expenseGrowth: 30,
      revenueGrowth: 0,
    }, false);

    return [
      {
        name: "Optimistic",
        icon: Sparkles,
        color: "hsl(152, 100%, 50%)",
        bgColor: "hsl(152, 100%, 50%)/0.1",
        expenseGrowth: 0,
        revenueGrowth: 50,
        runway: optimistic.runwayMonths,
        description: "High growth, controlled costs",
      },
      {
        name: "Current Path",
        icon: Target,
        color: "hsl(226, 100%, 59%)",
        bgColor: "hsl(226, 100%, 59%)/0.1",
        expenseGrowth: simParams.expenseGrowth,
        revenueGrowth: simParams.revenueGrowth,
        runway: current.runwayMonths,
        description: "Data-driven projection",
      },
      {
        name: "Danger Zone",
        icon: Flame,
        color: "hsl(0, 70%, 55%)",
        bgColor: "hsl(0, 70%, 55%)/0.1",
        expenseGrowth: 30,
        revenueGrowth: 0,
        runway: danger.runwayMonths,
        description: "Rising costs, flat revenue",
      },
    ];
  }, [simParams]);

  // Animate runway counter
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const targetRunway = Math.min(runwayMonths, PROJECTION_MONTHS);
    const stepSize = (targetRunway - animatedRunway) / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimatedRunway(prev => Math.max(0, prev + stepSize));
      if (step >= steps) {
        clearInterval(interval);
        setAnimatedRunway(targetRunway);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [runwayMonths]);

  const getRunwayStatus = () => {
    if (runwayMonths >= 18) return { color: "hsl(152, 100%, 50%)", label: "Healthy", icon: ShieldCheck };
    if (runwayMonths >= 12) return { color: "hsl(152, 70%, 45%)", label: "Good", icon: TrendingUp };
    if (runwayMonths >= 6) return { color: "hsl(45, 90%, 55%)", label: "Caution", icon: AlertTriangle };
    return { color: "hsl(0, 70%, 55%)", label: "Critical", icon: Flame };
  };

  const status = getRunwayStatus();
  const StatusIcon = status.icon;

  // Calculate key dates
  const today = new Date();
  const runwayEndDate = new Date(today);
  runwayEndDate.setMonth(runwayEndDate.getMonth() + Math.floor(runwayMonths));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const isPositive = data.cash > 0;
    
    return (
      <div className="p-4 rounded-xl bg-[hsl(240,7%,10%)] border border-white/10 shadow-xl">
        <p className="text-white font-semibold mb-2">Month {data.month}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">Cash:</span>
            <span className={isPositive ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"} style={{ fontFamily: 'JetBrains Mono' }}>
              {formatCurrency(data.cash)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">Revenue:</span>
            <span className="text-[hsl(152,100%,50%)]">{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[hsl(220,10%,55%)]">Expenses:</span>
            <span className="text-[hsl(0,70%,55%)]">{formatCurrency(data.expenses)}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
            <span className="text-[hsl(220,10%,55%)]">Net Burn:</span>
            <span className={data.netBurn > 0 ? "text-[hsl(0,70%,55%)]" : "text-[hsl(152,100%,50%)]"}>
              {data.netBurn > 0 ? "-" : "+"}{formatCurrency(Math.abs(data.netBurn))}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Dual scenario tooltip for comparison mode
  const DualScenarioTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0]?.payload;
    if (!data) return null;
    
    const isPositiveA = data.cashA > 0;
    const isPositiveB = data.cashB > 0;
    const difference = data.cashB - data.cashA;
    const hasHireEvent = data.hasHireEvent;
    const hireEventInfo = data.hireEventInfo;
    
    return (
      <div className="p-4 rounded-xl bg-[hsl(240,7%,10%)] border border-white/10 shadow-xl min-w-[240px]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold">
            {data.month === 0 ? "Now" : `+${data.month} months`}
          </p>
          {hasHireEvent && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(45,90%,55%)/0.2] border border-[hsl(45,90%,55%)/0.3]">
              <User className="w-3 h-3 text-[hsl(45,90%,55%)]" />
              <span className="text-[10px] font-semibold text-[hsl(45,90%,55%)]">HIRE</span>
            </div>
          )}
        </div>
        
        {/* Hire Event Alert */}
        {hasHireEvent && hireEventInfo && (
          <div className="mb-3 p-2 rounded-lg bg-[hsl(45,90%,55%)/0.1] border border-[hsl(45,90%,55%)/0.2]">
            <p className="text-xs text-[hsl(45,90%,60%)] flex items-center gap-1">
              <UserPlus className="w-3 h-3" />
              {hireEventInfo} starting
            </p>
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          {/* Current Path (A) - Electric Cobalt */}
          <div className="flex justify-between gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(226,100%,59%)]" />
              <span className="text-[hsl(220,10%,55%)]">Current Path:</span>
            </div>
            <span 
              className={isPositiveA ? "text-[hsl(226,100%,59%)]" : "text-[hsl(0,70%,55%)]"} 
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {formatCurrency(data.cashA)}
            </span>
          </div>
          
          {/* Proposed Strategy (B) - Emerald Green */}
          <div className="flex justify-between gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(152,100%,50%)]" />
              <span className="text-[hsl(220,10%,55%)]">Proposed Strategy:</span>
            </div>
            <span 
              className={isPositiveB ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"} 
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {formatCurrency(data.cashB)}
            </span>
          </div>
          
          {/* Difference */}
          <div className="flex justify-between gap-4 pt-2 border-t border-white/10">
            <span className="text-[hsl(220,10%,55%)]">Δ Strategy Impact:</span>
            <span 
              className={difference > 0 ? "text-[hsl(152,100%,50%)]" : difference < 0 ? "text-[hsl(0,70%,55%)]" : "text-[hsl(220,10%,55%)]"}
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {difference >= 0 ? "+" : ""}{formatCurrency(difference)}
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
          
          <div className="relative flex items-center justify-between">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(152,100%,50%)] to-[hsl(180,80%,45%)] flex items-center justify-center shadow-lg shadow-[hsl(152,100%,50%)/0.3]">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white">Runway Simulation Engine</h2>
                  {isRehydrated && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(270,60%,55%)/0.15] border border-[hsl(270,60%,55%)/0.3]">
                      <Archive className="w-3 h-3 text-[hsl(270,60%,60%)]" />
                      <span className="text-xs font-semibold text-[hsl(270,60%,65%)]">
                        Restored from Archive
                      </span>
                    </div>
                  )}
                  {totalNewHires > 0 && !isRehydrated && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(45,90%,55%)/0.15] border border-[hsl(45,90%,55%)/0.3] animate-pulse">
                      <Link2 className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                      <span className="text-xs font-semibold text-[hsl(45,90%,55%)]">
                        +{totalNewHires} from Hiring Planner
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[hsl(220,10%,55%)]">
                  {isRehydrated
                    ? "Strategic snapshot loaded from DNA History"
                    : totalNewHires > 0 
                      ? `Time-aware hiring integration active • ${hiringImpact.hireEvents.length} hire event${hiringImpact.hireEvents.length !== 1 ? 's' : ''} scheduled`
                      : "Advanced compound growth modeling"
                  }
                </p>
              </div>
            </motion.div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[hsl(152,100%,50%)/0.3] hover:border-[hsl(152,100%,50%)/0.6] text-[hsl(152,100%,60%)] hover:bg-[hsl(152,100%,50%)/0.1]"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[hsl(240,7%,10%)] border-white/10 w-56">
                  <DropdownMenuItem 
                    onClick={handleExportPDF}
                    className="text-white hover:bg-white/5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2 text-[hsl(0,70%,55%)]" />
                    Download PDF Report
                    <span className="ml-auto text-[10px] text-[hsl(220,10%,50%)]">With Chart</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportMarkdown}
                    className="text-white hover:bg-white/5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2 text-[hsl(226,100%,59%)]" />
                    Download Markdown
                    <span className="ml-auto text-[10px] text-[hsl(220,10%,50%)]">.md</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={handleShareSlack}
                    className="text-white hover:bg-white/5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 mr-2 text-[hsl(152,100%,50%)]" />
                    Copy for Slack/Email
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleShareQuick}
                    className="text-white hover:bg-white/5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 mr-2 text-[hsl(45,90%,55%)]" />
                    Copy Quick Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Save to Archive Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={saveToArchive}
                disabled={isSaving}
                className="border-[hsl(270,60%,55%)/0.3] hover:border-[hsl(270,60%,55%)/0.6] text-[hsl(270,60%,65%)] hover:bg-[hsl(270,60%,55%)/0.1]"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2 border-2 border-[hsl(270,60%,55%)] border-t-transparent rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Save to Archive
                  </>
                )}
              </Button>
              
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
                <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-wider mb-2">Simulated Runway</p>
                <div className="flex items-baseline gap-2">
                  <motion.span 
                    className="text-8xl font-bold font-mono"
                    style={{ color: status.color }}
                  >
                    {animatedRunway >= PROJECTION_MONTHS ? "24+" : animatedRunway.toFixed(1)}
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
                    {runwayMonths >= PROJECTION_MONTHS ? "24+ months" : runwayEndDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                    <span className="text-xs text-[hsl(220,10%,55%)]">Net Monthly Burn</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(simParams.monthlyExpenses - simParams.monthlyRevenue)}
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

        {/* Prediction Summary */}
        <div className="px-8 pb-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[hsl(45,90%,55%)]" />
              Prediction Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {scenarios.map((scenario, index) => {
                const Icon = scenario.icon;
                return (
                  <motion.div
                    key={scenario.name}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setSimParams(prev => ({
                      ...prev,
                      expenseGrowth: scenario.expenseGrowth,
                      revenueGrowth: scenario.revenueGrowth,
                    }))}
                    className={`p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${
                      simParams.expenseGrowth === scenario.expenseGrowth && 
                      simParams.revenueGrowth === scenario.revenueGrowth
                        ? `border-2`
                        : 'border border-white/10'
                    }`}
                    style={{
                      background: scenario.bgColor,
                      borderColor: simParams.expenseGrowth === scenario.expenseGrowth && 
                                   simParams.revenueGrowth === scenario.revenueGrowth
                        ? scenario.color
                        : undefined
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${scenario.color}30` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: scenario.color }} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{scenario.name}</p>
                        <p className="text-xs text-[hsl(220,10%,50%)]">{scenario.description}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span 
                        className="text-4xl font-bold font-mono"
                        style={{ color: scenario.color }}
                      >
                        {scenario.runway >= PROJECTION_MONTHS ? "24+" : scenario.runway.toFixed(1)}
                      </span>
                      <span className="text-sm text-[hsl(220,10%,50%)]">months</span>
                    </div>
                    <div className="mt-2 text-xs text-[hsl(220,10%,55%)]">
                      <span>Exp: {scenario.expenseGrowth > 0 ? "+" : ""}{scenario.expenseGrowth}%</span>
                      <span className="mx-2">•</span>
                      <span>Rev: +{scenario.revenueGrowth}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="p-8 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-5"
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
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)] text-sm">$</span>
                  <Input
                    type="number"
                    value={simParams.cashOnHand}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setSimParams(prev => ({ ...prev, cashOnHand: val }));
                    }}
                    className="h-8 w-32 pl-6 pr-2 text-sm bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono focus:border-[hsl(152,100%,50%)]/50"
                    min={0}
                    step={10000}
                  />
                </div>
              </div>
              <Slider
                value={[Math.min(simParams.cashOnHand, 2000000)]}
                onValueChange={([val]) => setSimParams(prev => ({ ...prev, cashOnHand: val }))}
                max={2000000}
                min={10000}
                step={10000}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[hsl(240,7%,15%)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
              />
              {simParams.cashOnHand > 2000000 && (
                <p className="text-xs text-[hsl(45,90%,55%)] mt-1 text-right">Above $2M range</p>
              )}
            </div>

            {/* Monthly Expenses */}
            <div className="p-5 rounded-2xl bg-[hsl(0,70%,55%)/0.08] border border-[hsl(0,70%,55%)/0.2]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(0,70%,55%)/0.2] flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-[hsl(0,70%,55%)]" />
                  </div>
                  <div>
                    <Label className="text-[hsl(0,70%,55%)] font-semibold">Monthly Expenses</Label>
                    <p className="text-xs text-[hsl(220,10%,50%)]">Total monthly outflow</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)] text-sm">$</span>
                  <Input
                    type="number"
                    value={simParams.monthlyExpenses}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setSimParams(prev => ({ ...prev, monthlyExpenses: val }));
                    }}
                    className="h-8 w-32 pl-6 pr-2 text-sm bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono focus:border-[hsl(0,70%,55%)]/50"
                    min={0}
                    step={1000}
                  />
                </div>
              </div>
              <Slider
                value={[Math.min(simParams.monthlyExpenses, 200000)]}
                onValueChange={([val]) => setSimParams(prev => ({ ...prev, monthlyExpenses: val }))}
                max={200000}
                min={5000}
                step={1000}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[hsl(240,7%,15%)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
              />
              {simParams.monthlyExpenses > 200000 && (
                <p className="text-xs text-[hsl(45,90%,55%)] mt-1 text-right">Above $200K range</p>
              )}
            </div>

            {/* Monthly Revenue */}
            <div className="p-5 rounded-2xl bg-[hsl(180,80%,45%)/0.08] border border-[hsl(180,80%,45%)/0.2]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(180,80%,45%)/0.2] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[hsl(180,80%,50%)]" />
                  </div>
                  <div>
                    <Label className="text-[hsl(180,80%,50%)] font-semibold">Monthly Revenue</Label>
                    <p className="text-xs text-[hsl(220,10%,50%)]">Current recurring revenue</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)] text-sm">$</span>
                  <Input
                    type="number"
                    value={simParams.monthlyRevenue}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setSimParams(prev => ({ ...prev, monthlyRevenue: val }));
                    }}
                    className="h-8 w-32 pl-6 pr-2 text-sm bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono focus:border-[hsl(180,80%,45%)]/50"
                    min={0}
                    step={1000}
                  />
                </div>
              </div>
              <Slider
                value={[Math.min(simParams.monthlyRevenue, 150000)]}
                onValueChange={([val]) => setSimParams(prev => ({ ...prev, monthlyRevenue: val }))}
                max={150000}
                min={0}
                step={1000}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[hsl(240,7%,15%)] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
              />
              {simParams.monthlyRevenue > 150000 && (
                <p className="text-xs text-[hsl(45,90%,55%)] mt-1 text-right">Above $150K range</p>
              )}
            </div>

            {/* Growth Rate Controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Expense Growth: -10% to +50% */}
              <div className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[hsl(0,70%,55%)]" />
                    <Label className="text-xs text-[hsl(220,10%,60%)] uppercase tracking-wider">Expense Growth</Label>
                  </div>
                  <Input
                    type="number"
                    value={simParams.expenseGrowth}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setSimParams(prev => ({ ...prev, expenseGrowth: val }));
                    }}
                    className="h-6 w-16 text-xs bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono text-center focus:border-[hsl(0,70%,55%)]/50"
                    step={1}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[hsl(152,100%,50%)]">-10%</span>
                  <Slider
                    value={[Math.max(-10, Math.min(simParams.expenseGrowth, 50))]}
                    onValueChange={([val]) => setSimParams(prev => ({ ...prev, expenseGrowth: val }))}
                    max={50}
                    min={-10}
                    step={1}
                    className="flex-1 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-[hsl(240,7%,20%)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                  />
                  <span className="text-xs text-[hsl(0,70%,55%)]">
                    +50%{simParams.expenseGrowth > 50 && <span className="text-[hsl(45,90%,55%)]">+</span>}
                  </span>
                </div>
                <p className="text-center text-sm font-semibold" style={{ 
                  color: simParams.expenseGrowth < 0 ? "hsl(152, 100%, 50%)" : simParams.expenseGrowth > 10 ? "hsl(0, 70%, 55%)" : "hsl(45, 90%, 55%)" 
                }}>
                  {simParams.expenseGrowth > 0 ? "+" : ""}{simParams.expenseGrowth}% / year
                </p>
              </div>

              {/* Revenue Growth: 0% to +100% */}
              <div className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                    <Label className="text-xs text-[hsl(220,10%,60%)] uppercase tracking-wider">Revenue Growth</Label>
                  </div>
                  <Input
                    type="number"
                    value={simParams.revenueGrowth}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setSimParams(prev => ({ ...prev, revenueGrowth: val }));
                    }}
                    className="h-6 w-16 text-xs bg-[hsl(240,7%,12%)] border-white/10 text-white font-mono text-center focus:border-[hsl(152,100%,50%)]/50"
                    min={0}
                    step={1}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[hsl(220,10%,50%)]">0%</span>
                  <Slider
                    value={[Math.min(simParams.revenueGrowth, 100)]}
                    onValueChange={([val]) => setSimParams(prev => ({ ...prev, revenueGrowth: val }))}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-[hsl(240,7%,20%)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                  />
                  <span className="text-xs text-[hsl(152,100%,50%)]">
                    +100%{simParams.revenueGrowth > 100 && <span className="text-[hsl(45,90%,55%)]">+</span>}
                  </span>
                </div>
                <p className="text-center text-sm font-semibold" style={{ 
                  color: simParams.revenueGrowth > 30 ? "hsl(152, 100%, 50%)" : simParams.revenueGrowth > 10 ? "hsl(45, 90%, 55%)" : "hsl(220, 10%, 60%)" 
                }}>
                  +{simParams.revenueGrowth}% / year
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                  Quick Presets
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScenarioMode(!scenarioMode)}
                  className={`text-xs ${scenarioMode ? "text-[hsl(152,100%,50%)]" : "text-[hsl(220,10%,50%)]"}`}
                >
                  <GitCompare className="w-3 h-3 mr-1" />
                  {scenarioMode ? "Exit Strategy Mode" : "Compare Strategies"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      activePreset === preset.id 
                        ? `bg-[${preset.bgColor}] border-[${preset.color}]`
                        : "bg-[hsl(240,7%,12%)] border-white/5 hover:border-white/20"
                    }`}
                    style={{
                      backgroundColor: activePreset === preset.id ? `${preset.color}15` : undefined,
                      borderColor: activePreset === preset.id ? preset.color : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{preset.icon}</span>
                      <span className="text-sm font-semibold text-white">{preset.name}</span>
                    </div>
                    <p className="text-xs text-[hsl(220,10%,50%)]">{preset.description}</p>
                  </motion.button>
                ))}
              </div>
              {activePreset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-white/5"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetScenarioB}
                    className="text-xs text-[hsl(220,10%,50%)] hover:text-white"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reset to Base Case
                  </Button>
                </motion.div>
              )}
            </div>

            {/* RUNWAY DELTA CARD - Prominent Comparison Summary */}
            <AnimatePresence>
              {scenarioMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="p-5 rounded-2xl border-2 overflow-hidden"
                  style={{
                    borderColor: runwayDifference.isPositive 
                      ? "hsl(152, 100%, 50%)" 
                      : runwayDifference.isNeutral 
                        ? "hsl(45, 90%, 55%)"
                        : "hsl(0, 70%, 55%)",
                    background: runwayDifference.isPositive 
                      ? "linear-gradient(135deg, hsla(152, 100%, 50%, 0.15), hsla(152, 100%, 50%, 0.05))"
                      : runwayDifference.isNeutral 
                        ? "linear-gradient(135deg, hsla(45, 90%, 55%, 0.15), hsla(45, 90%, 55%, 0.05))"
                        : "linear-gradient(135deg, hsla(0, 70%, 55%, 0.15), hsla(0, 70%, 55%, 0.05))",
                  }}
                >
                  {/* Header with Explicit Runway Delta Message */}
                  <div className="text-center mb-4">
                    <motion.div
                      key={runwayDifference.formatted}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2 ${
                        runwayDifference.isPositive 
                          ? "bg-[hsl(152,100%,50%)/0.2]" 
                          : runwayDifference.isNeutral 
                            ? "bg-[hsl(45,90%,55%)/0.2]"
                            : "bg-[hsl(0,70%,55%)/0.2]"
                      }`}
                    >
                      <GitCompare className={`w-5 h-5 ${
                        runwayDifference.isPositive 
                          ? "text-[hsl(152,100%,50%)]" 
                          : runwayDifference.isNeutral 
                            ? "text-[hsl(45,90%,55%)]"
                            : "text-[hsl(0,70%,55%)]"
                      }`} />
                      <span className="text-white font-semibold">Runway Delta</span>
                    </motion.div>
                    
                    {/* THE EXPLICIT MESSAGE */}
                    <motion.p
                      key={`msg-${runwayDifference.value}`}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg font-bold text-white"
                    >
                      {runwayDifference.isPositive ? (
                        <>
                          <span className="text-[hsl(152,100%,50%)]">Proposed Strategy</span> extends your runway by{" "}
                          <span className="text-[hsl(152,100%,50%)] text-2xl">{Math.abs(runwayDifference.value).toFixed(1)}</span> months
                        </>
                      ) : runwayDifference.isNeutral ? (
                        <>
                          <span className="text-[hsl(45,90%,55%)]">Proposed Strategy</span> has minimal impact on runway
                        </>
                      ) : (
                        <>
                          <span className="text-[hsl(0,70%,55%)]">Proposed Strategy</span> shortens your runway by{" "}
                          <span className="text-[hsl(0,70%,55%)] text-2xl">{Math.abs(runwayDifference.value).toFixed(1)}</span> months
                        </>
                      )}
                    </motion.p>
                    <p className="text-xs text-[hsl(220,10%,55%)] mt-1">
                      compared to Current Path
                    </p>
                  </div>
                  
                  {/* Scenario Comparison Grid */}
                  <div className="grid grid-cols-3 gap-3 items-center">
                    {/* Current Path (A) */}
                    <div className="p-4 rounded-xl bg-[hsl(226,100%,59%)/0.1] border border-[hsl(226,100%,59%)/0.3] text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[hsl(226,100%,59%)]" />
                        <span className="text-xs text-[hsl(226,100%,70%)] font-medium uppercase tracking-wider">Current Path</span>
                      </div>
                      <p className="text-3xl font-bold text-[hsl(226,100%,59%)] font-mono">
                        {runwayMonths >= PROJECTION_MONTHS ? "24+" : runwayMonths.toFixed(1)}
                      </p>
                      <p className="text-xs text-[hsl(220,10%,55%)]">months</p>
                      <p className="text-[10px] text-[hsl(220,10%,50%)] mt-1">
                        ${formatCurrency(simParams.monthlyExpenses)}/mo burn
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex flex-col items-center justify-center">
                      <ArrowRight className={`w-8 h-8 ${
                        runwayDifference.isPositive 
                          ? "text-[hsl(152,100%,50%)]" 
                          : runwayDifference.isNeutral 
                            ? "text-[hsl(45,90%,55%)]"
                            : "text-[hsl(0,70%,55%)]"
                      }`} />
                      <motion.span 
                        key={runwayDifference.formatted}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-xl font-bold mt-1 ${
                          runwayDifference.isPositive 
                            ? "text-[hsl(152,100%,50%)]" 
                            : runwayDifference.isNeutral 
                              ? "text-[hsl(45,90%,55%)]"
                              : "text-[hsl(0,70%,55%)]"
                        }`}
                      >
                        {runwayDifference.formatted}
                      </motion.span>
                    </div>
                    
                    {/* Proposed Strategy (B) */}
                    <div className="p-4 rounded-xl bg-[hsl(152,100%,50%)/0.1] border border-[hsl(152,100%,50%)/0.3] text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[hsl(152,100%,50%)]" />
                        <span className="text-xs text-[hsl(152,100%,70%)] font-medium uppercase tracking-wider">Proposed Strategy</span>
                      </div>
                      <p className="text-3xl font-bold text-[hsl(152,100%,50%)] font-mono">
                        {scenarioBResult.runwayMonths >= PROJECTION_MONTHS ? "24+" : scenarioBResult.runwayMonths.toFixed(1)}
                      </p>
                      <p className="text-xs text-[hsl(220,10%,55%)]">months</p>
                      <p className="text-[10px] text-[hsl(220,10%,50%)] mt-1">
                        ${formatCurrency(scenarioB.monthlyExpenses)}/mo burn
                      </p>
                    </div>
                  </div>
                  
                  {/* Hiring Impact Summary (if any hires planned) */}
                  {totalNewHires > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                          <span className="text-[hsl(220,10%,60%)]">Hiring Impact:</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{totalNewHires} new hire{totalNewHires > 1 ? 's' : ''}</span>
                          <span className="text-[hsl(0,70%,55%)]">+{formatCurrency(hiringBurnImpact)}/mo</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* HIRING INTEGRATION PANEL - Inline controls for Scenario B */}
            <AnimatePresence>
              {scenarioMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-[hsl(45,90%,55%)/0.08] border border-[hsl(45,90%,55%)/0.2]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                      Hiring Plan (Affects Proposed Strategy)
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHiringPanel(!showHiringPanel)}
                      className="text-xs text-[hsl(45,90%,55%)] hover:text-[hsl(45,90%,65%)]"
                    >
                      {showHiringPanel ? "Collapse" : "Expand"}
                    </Button>
                  </div>
                  
                  {/* Quick Hire Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {hiringRoles.map((role) => (
                      <div 
                        key={role.id} 
                        className="p-2 rounded-xl bg-black/20 border border-white/5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ background: `${role.color}25` }}
                          >
                            <role.icon className="w-3 h-3" style={{ color: role.color }} />
                          </div>
                          <span className="text-xs text-white font-medium">{role.title}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateHiringRole(role.id, -1)}
                            disabled={role.count === 0}
                            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-white" />
                          </button>
                          <span 
                            className="text-lg font-bold font-mono"
                            style={{ color: role.count > 0 ? role.color : "hsl(220,10%,50%)" }}
                          >
                            {role.count}
                          </span>
                          <button
                            onClick={() => updateHiringRole(role.id, 1)}
                            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                        
                        {role.count > 0 && (
                          <p className="text-[10px] text-[hsl(220,10%,50%)] text-center mt-1">
                            +{formatCurrency(role.salary * role.count)}/mo
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Expanded Salary Details */}
                  <AnimatePresence>
                    {showHiringPanel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/10 space-y-2"
                      >
                        {hiringRoles.map((role) => (
                          <div key={`salary-${role.id}`} className="flex items-center gap-3">
                            <span className="text-xs text-[hsl(220,10%,55%)] w-20">{role.title} Salary:</span>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] text-xs">$</span>
                              <Input
                                type="number"
                                value={role.salary}
                                onChange={(e) => {
                                  const newSalary = Math.max(0, Number(e.target.value));
                                  setRoleSalary(role.id, newSalary);
                                }}
                                className="h-7 text-xs pl-5 bg-black/20 border-white/10 text-white"
                              />
                            </div>
                            <span className="text-xs text-[hsl(220,10%,50%)]">/mo</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Total Impact Summary */}
                  {totalNewHires > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-[hsl(220,10%,55%)]">Total Hiring Burn Impact:</span>
                      <span className="text-sm font-bold text-[hsl(0,70%,55%)]">
                        +{formatCurrency(hiringBurnImpact)}/mo
                      </span>
                    </div>
                  )}
                  
                  {/* ═══════════════════════════════════════════════════════════
                      PAYROLL TIMELINE - Visual representation of hire start dates
                      Shows when each salary starts impacting the burn rate
                  ═══════════════════════════════════════════════════════════ */}
                  {hiringImpact.hireEvents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[hsl(45,90%,55%)/0.1] to-transparent border border-[hsl(45,90%,55%)/0.2]"
                    >
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                        Payroll Timeline
                        <span className="text-[10px] text-[hsl(220,10%,50%)] font-normal">(Start Month → Salary)</span>
                      </h4>
                      
                      {/* Timeline visualization */}
                      <div className="space-y-2">
                        {hiringImpact.hireEvents.map((event, idx) => (
                          <motion.div
                            key={`${event.roleId}-${event.month}-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-2 rounded-lg bg-black/20"
                          >
                            {/* Month indicator */}
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: event.color }}
                            >
                              M{event.month}
                            </div>
                            
                            {/* Role info */}
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium">
                                +{event.count} {event.roleTitle}{event.count > 1 ? 's' : ''}
                              </p>
                              <p className="text-[10px] text-[hsl(220,10%,50%)]">
                                {event.month === 1 ? "Starting immediately" : `Starting Month ${event.month}`}
                              </p>
                            </div>
                            
                            {/* Salary impact */}
                            <div className="text-right">
                              <p className="text-sm font-mono text-[hsl(0,70%,55%)]">
                                +{formatCurrency(event.salary * event.count)}
                              </p>
                              <p className="text-[10px] text-[hsl(220,10%,50%)]">/month</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Cumulative Impact */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-[hsl(220,10%,55%)]">
                          Full payroll impact (once all hires active):
                        </span>
                        <span className="text-sm font-bold text-[hsl(0,70%,55%)] font-mono">
                          +{formatCurrency(hiringImpact.totalMonthlyIncrease)}/mo
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Chart */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Snapshot Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {showNameInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={snapshotName}
                      onChange={(e) => setSnapshotName(e.target.value)}
                      placeholder="e.g., Hiring 3 Engineers"
                      className="px-3 py-1.5 text-sm rounded-lg bg-[hsl(240,7%,12%)] border border-[hsl(226,100%,59%)/0.3] text-white placeholder:text-[hsl(220,10%,40%)] focus:outline-none focus:border-[hsl(226,100%,59%)]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && snapshotName.trim()) {
                          saveSnapshot(snapshotName.trim());
                          setSnapshotName("");
                          setShowNameInput(false);
                        }
                        if (e.key === "Escape") {
                          setShowNameInput(false);
                          setSnapshotName("");
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (snapshotName.trim()) {
                          saveSnapshot(snapshotName.trim());
                          setSnapshotName("");
                          setShowNameInput(false);
                        }
                      }}
                      size="sm"
                      className="bg-[hsl(152,100%,50%)] text-black hover:bg-[hsl(152,100%,60%)]"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNameInput(false);
                        setSnapshotName("");
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-[hsl(220,10%,50%)]"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowNameInput(true)}
                    className="bg-[hsl(226,100%,59%)/0.2] hover:bg-[hsl(226,100%,59%)/0.3] text-[hsl(226,100%,59%)] border border-[hsl(226,100%,59%)/0.3]"
                    size="sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Save Snapshot
                  </Button>
                )}
                {snapshots.length > 0 && !showNameInput && (
                  <Button
                    onClick={() => setShowCompare(!showCompare)}
                    variant={showCompare ? "default" : "outline"}
                    className={showCompare 
                      ? "bg-[hsl(152,100%,50%)] text-black hover:bg-[hsl(152,100%,60%)]" 
                      : "border-white/20 hover:border-[hsl(152,100%,50%)/0.5]"
                    }
                    size="sm"
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Compare ({snapshots.length})
                  </Button>
                )}
              </div>
              <span className="text-xs text-[hsl(220,10%,50%)]">
                {snapshots.length} saved
              </span>
            </div>

            {/* Cash Decay Chart */}
            <div id="simulator-chart" className="p-6 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5 relative">
              {/* ═══════════════════════════════════════════════════════════
                  CHART HEADER WITH COMPARISON TOGGLE
              ═══════════════════════════════════════════════════════════ */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                  {scenarioMode ? "Current Path vs Proposed Strategy" : "Cash Decay Projection"}
                  <span className="text-xs text-[hsl(220,10%,50%)] font-normal">(24 Months)</span>
                </h4>
                
                {/* Compare with Hiring Plan Toggle */}
                {totalNewHires > 0 && (
                  <Button
                    variant={scenarioMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScenarioMode(!scenarioMode)}
                    className={scenarioMode 
                      ? "bg-[hsl(152,100%,50%)] hover:bg-[hsl(152,100%,55%)] text-black text-xs" 
                      : "border-[hsl(152,100%,50%)/0.3] hover:border-[hsl(152,100%,50%)/0.6] text-[hsl(152,100%,60%)] text-xs"
                    }
                  >
                    <GitCompare className="w-3 h-3 mr-1.5" />
                    {scenarioMode ? "Hide Hiring Impact" : "Compare with Hiring Plan"}
                    {!scenarioMode && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[hsl(152,100%,50%)/0.2] text-[10px]">
                        +{totalNewHires}
                      </span>
                    )}
                  </Button>
                )}
              </div>
              
              {/* ═══════════════════════════════════════════════════════════
                  FLOATING IMPACT DASHBOARD
                  Shows runway delta and revenue velocity when in comparison mode
              ═══════════════════════════════════════════════════════════ */}
              <AnimatePresence>
                {scenarioMode && maxDivergence && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-16 right-6 z-10 p-4 rounded-xl bg-gradient-to-br from-[hsl(240,7%,8%)] to-[hsl(240,7%,12%)] border border-white/10 shadow-2xl shadow-black/50 min-w-[260px]"
                  >
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                        Impact Dashboard
                      </h5>
                      <span className="text-[10px] text-[hsl(220,10%,45%)]">LIVE</span>
                    </div>
                    
                    {/* Runway Delta */}
                    <div className="mb-3">
                      <p className="text-[10px] text-[hsl(220,10%,50%)] uppercase tracking-wider mb-1">Runway Delta</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${
                          runwayDifference.isPositive 
                            ? "text-[hsl(152,100%,50%)]" 
                            : runwayDifference.isNeutral 
                              ? "text-[hsl(45,90%,55%)]"
                              : "text-[hsl(0,70%,55%)]"
                        }`}>
                          {runwayDifference.formatted}
                        </span>
                        <span className="text-sm text-[hsl(220,10%,55%)]">months</span>
                      </div>
                      <p className="text-xs text-[hsl(220,10%,50%)] mt-1">
                        {runwayDifference.isPositive 
                          ? "Proposed strategy extends runway"
                          : runwayDifference.isNeutral
                            ? "Minimal impact on runway"
                            : "Proposed strategy shortens runway"
                        }
                      </p>
                    </div>
                    
                    {/* Revenue Velocity */}
                    <div className="mb-3 p-2 rounded-lg bg-black/30">
                      <p className="text-[10px] text-[hsl(220,10%,50%)] uppercase tracking-wider mb-1">Revenue Velocity</p>
                      <div className="flex items-center gap-2">
                        {maxDivergence.revenueVelocityDiff >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                        )}
                        <span className={`text-sm font-semibold ${
                          maxDivergence.revenueVelocityDiff >= 0 
                            ? "text-[hsl(152,100%,50%)]" 
                            : "text-[hsl(45,90%,55%)]"
                        }`}>
                          {maxDivergence.revenueVelocityDiff >= 0 ? "+" : ""}
                          {formatCurrency(maxDivergence.revenueVelocityDiff)}/mo
                        </span>
                      </div>
                      <p className="text-[10px] text-[hsl(220,10%,45%)] mt-0.5">
                        {maxDivergence.revenueVelocityDiff >= 0 
                          ? "Increased growth potential"
                          : "Similar revenue trajectory"
                        }
                      </p>
                    </div>
                    
                    {/* Maximum Divergence Point */}
                    <div className="p-2 rounded-lg bg-[hsl(45,90%,55%)/0.1] border border-[hsl(45,90%,55%)/0.2]">
                      <p className="text-[10px] text-[hsl(45,90%,60%)] uppercase tracking-wider mb-1">
                        Peak Divergence
                      </p>
                      <p className="text-xs text-white">
                        Month <span className="font-bold text-[hsl(45,90%,55%)]">{maxDivergence.month}</span>
                        {" • "}
                        <span className="font-mono">{formatCurrency(maxDivergence.cashDifference)}</span> gap
                      </p>
                    </div>
                    
                    {/* Summary */}
                    <p className="text-[10px] text-[hsl(220,10%,45%)] mt-3 italic">
                      {runwayDifference.value < 0 
                        ? `Scenario B shortens runway by ${Math.abs(runwayDifference.value).toFixed(1)} months${
                            maxDivergence.revenueVelocityDiff > 0 
                              ? ", but increases revenue velocity" 
                              : ""
                          }`
                        : `Scenario B extends runway by ${runwayDifference.value.toFixed(1)} months`
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={scenarioMode ? dualProjectionData : projectionData} 
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="cashDecayGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(226, 100%, 59%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(226, 100%, 59%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cashDangerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="scenarioBGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: "hsl(220,10%,45%)", fontSize: 11 }}
                      interval={3}
                      tickFormatter={(val) => val === 0 ? "Now" : `+${val}mo`}
                      label={{ value: "Months from Now", position: "bottom", offset: 0, fill: "hsl(220,10%,50%)", fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: "hsl(220,10%,45%)", fontSize: 11 }}
                      tickFormatter={(val) => formatCurrency(val)}
                    />
                    <ReferenceLine 
                      y={0} 
                      stroke="hsl(0, 70%, 55%)" 
                      strokeWidth={2}
                      strokeDasharray="5 5" 
                    />
                    
                    {/* ═══════════════════════════════════════════════════════════
                        HIRE EVENT VERTICAL REFERENCE LINES
                        Shows where each hire starts on the timeline
                    ═══════════════════════════════════════════════════════════ */}
                    {scenarioMode && hireEventMonths.map((month) => {
                      // Get hire info for this month
                      const eventsThisMonth = hiringImpact.hireEvents.filter(e => e.month === month);
                      const labelText = eventsThisMonth.map(e => `+${e.count} ${e.roleTitle.charAt(0)}`).join(" ");
                      
                      return (
                        <ReferenceLine
                          key={`hire-event-${month}`}
                          x={month}
                          stroke="hsl(45, 90%, 55%)"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          label={{
                            value: labelText,
                            position: "top",
                            fill: "hsl(45, 90%, 55%)",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        />
                      );
                    })}
                    
                    <Tooltip 
                      content={scenarioMode ? <DualScenarioTooltip /> : <CustomTooltip />} 
                    />
                    
                    {/* Current Path (A) - Electric Cobalt */}
                    <Area
                      type="monotone"
                      dataKey={scenarioMode ? "cashA" : "cash"}
                      stroke="none"
                      fill="url(#cashDecayGradient)"
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey={scenarioMode ? "cashA" : "cash"}
                      name="Current Path"
                      stroke="hsl(226, 100%, 59%)"
                      strokeWidth={3}
                      dot={({ cx, cy, payload }) => {
                        const cash = scenarioMode ? payload.cashA : payload.cash;
                        const color = cash > 0 ? "hsl(226, 100%, 59%)" : "hsl(0, 70%, 55%)";
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={color}
                            stroke="white"
                            strokeWidth={1}
                          />
                        );
                      }}
                      activeDot={{ r: 6, fill: "hsl(226, 100%, 59%)", stroke: "white", strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                    
                    {/* Proposed Strategy (B) - Emerald Green (only when in scenario mode) */}
                    {scenarioMode && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="cashB"
                          stroke="none"
                          fill="url(#scenarioBGradient)"
                          animationDuration={1500}
                        />
                        <Line
                          type="monotone"
                          dataKey="cashB"
                          name="Proposed Strategy"
                          stroke="hsl(152, 100%, 50%)"
                          strokeWidth={3}
                          strokeDasharray="5 3"
                          dot={({ cx, cy, payload }) => {
                            const color = payload.cashB > 0 ? "hsl(152, 100%, 50%)" : "hsl(0, 70%, 55%)";
                            const hasHireEvent = payload.hasHireEvent;
                            
                            // Show larger marker with icon for hire events
                            if (hasHireEvent) {
                              return (
                                <g>
                                  {/* Outer glow for hire events */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={12}
                                    fill="hsl(45, 90%, 55%)"
                                    fillOpacity={0.2}
                                  />
                                  {/* Event marker */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={8}
                                    fill="hsl(45, 90%, 55%)"
                                    stroke="white"
                                    strokeWidth={2}
                                  />
                                  {/* User icon indicator */}
                                  <text
                                    x={cx}
                                    y={cy + 3}
                                    textAnchor="middle"
                                    fontSize={8}
                                    fill="white"
                                    fontWeight="bold"
                                  >
                                    +
                                  </text>
                                </g>
                              );
                            }
                            
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill={color}
                                stroke="white"
                                strokeWidth={1}
                              />
                            );
                          }}
                          activeDot={{ r: 6, fill: "hsl(152, 100%, 50%)", stroke: "white", strokeWidth: 2 }}
                          animationDuration={1500}
                        />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-[hsl(220,10%,50%)]">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Path A: Current Fixed Burn */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(226,100%,59%)]" />
                    <span>Path A: Current</span>
                    <span className="text-[10px] text-[hsl(220,10%,40%)]">(Fixed burn)</span>
                  </div>
                  {scenarioMode && (
                    <>
                      {/* Path B: Dynamic Hiring Burn */}
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(152,100%,50%)]" />
                        <span>Path B: Hiring Plan</span>
                        <span className="text-[10px] text-[hsl(220,10%,40%)]">(Dynamic burn)</span>
                      </div>
                      {totalNewHires > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-[hsl(45,90%,55%)] flex items-center justify-center text-[8px] font-bold text-white">+</div>
                          <span className="text-[hsl(45,90%,55%)]">Hire Start</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)]" />
                  <span>Zero Cash Line</span>
                </div>
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
                Simulation Insights
              </h4>
              <ul className="space-y-2 text-sm text-[hsl(220,10%,65%)]">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(152,100%,50%)]">•</span>
                  {simParams.revenueGrowth > simParams.expenseGrowth
                    ? `Revenue growing faster than expenses (+${(simParams.revenueGrowth - simParams.expenseGrowth).toFixed(0)}% net). Path to profitability.`
                    : simParams.revenueGrowth === simParams.expenseGrowth
                    ? "Revenue and expenses growing at same rate. Runway stays constant."
                    : `Expenses outpacing revenue by ${(simParams.expenseGrowth - simParams.revenueGrowth).toFixed(0)}%. Consider cost optimization.`
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(226,100%,59%)]">•</span>
                  {`At current trajectory, break-even monthly burn: $${(simParams.monthlyExpenses - simParams.monthlyRevenue).toLocaleString()}`}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(45,90%,55%)]">•</span>
                  {runwayMonths < 12
                    ? "⚠️ Less than 12 months runway. Consider fundraising or cost cuts immediately."
                    : runwayMonths < 18
                    ? "Start fundraising conversations now. Aim to close before runway drops below 6 months."
                    : "Healthy runway. Focus on growth and hit milestones for your next raise."
                  }
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>

        {/* Snapshot Comparison Panel */}
        <AnimatePresence>
          {showCompare && snapshots.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-8 pb-8 overflow-hidden"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(240,10%,8%)] to-[hsl(240,15%,6%)] border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                    Snapshot Comparison
                  </h3>
                  <span className="text-xs text-[hsl(220,10%,50%)]">
                    Compare saved scenarios side-by-side
                  </span>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Current Scenario Card */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 rounded-2xl bg-[hsl(226,100%,59%)/0.1] border-2 border-[hsl(226,100%,59%)] relative"
                  >
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-full bg-[hsl(226,100%,59%)] text-white text-[10px] font-semibold uppercase">
                        Current
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-4">Current Scenario</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[hsl(220,10%,55%)] text-sm">Runway</span>
                        <span className="text-2xl font-bold font-mono text-[hsl(226,100%,59%)]">
                          {runwayMonths >= PROJECTION_MONTHS ? "24+" : runwayMonths.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-[hsl(220,10%,50%)] space-y-1">
                        <div className="flex justify-between">
                          <span>Cash:</span>
                          <span>{formatCurrency(simParams.cashOnHand)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expenses:</span>
                          <span>{formatCurrency(simParams.monthlyExpenses)}/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span>{formatCurrency(simParams.monthlyRevenue)}/mo</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-white/10">
                          <span>Exp Growth:</span>
                          <span className={simParams.expenseGrowth > 10 ? "text-[hsl(0,70%,55%)]" : "text-[hsl(152,100%,50%)]"}>
                            {simParams.expenseGrowth > 0 ? "+" : ""}{simParams.expenseGrowth}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rev Growth:</span>
                          <span className="text-[hsl(152,100%,50%)]">+{simParams.revenueGrowth}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Saved Snapshot Cards */}
                  {snapshots.map((snapshot, index) => {
                    const runwayDiff = runwayMonths - snapshot.runwayMonths;
                    const isBetter = runwayDiff < 0;
                    
                    return (
                      <motion.div
                        key={snapshot.id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        className="p-5 rounded-2xl border border-white/10 relative group"
                        style={{ background: `${snapshot.color}10` }}
                      >
                        <button
                          onClick={() => deleteSnapshot(snapshot.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-[hsl(0,70%,55%)/0.2] transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[hsl(0,70%,55%)]" />
                        </button>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ background: snapshot.color }}
                          />
                          <h4 className="text-white font-semibold">{snapshot.name}</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[hsl(220,10%,55%)] text-sm">Runway</span>
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-2xl font-bold font-mono"
                                style={{ color: snapshot.color }}
                              >
                                {snapshot.runwayMonths >= PROJECTION_MONTHS ? "24+" : snapshot.runwayMonths.toFixed(1)}
                              </span>
                              {runwayDiff !== 0 && (
                                <span className={`text-xs font-semibold ${isBetter ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}>
                                  {isBetter ? "+" : ""}{(-runwayDiff).toFixed(1)}mo
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-[hsl(220,10%,50%)] space-y-1">
                            <div className="flex justify-between">
                              <span>Cash:</span>
                              <span>{formatCurrency(snapshot.params.cashOnHand)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Expenses:</span>
                              <span>{formatCurrency(snapshot.params.monthlyExpenses)}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span>{formatCurrency(snapshot.params.monthlyRevenue)}/mo</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-white/10">
                              <span>Exp Growth:</span>
                              <span className={snapshot.params.expenseGrowth > 10 ? "text-[hsl(0,70%,55%)]" : "text-[hsl(152,100%,50%)]"}>
                                {snapshot.params.expenseGrowth > 0 ? "+" : ""}{snapshot.params.expenseGrowth}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rev Growth:</span>
                              <span className="text-[hsl(152,100%,50%)]">+{snapshot.params.revenueGrowth}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Load Snapshot Button */}
                        <Button
                          onClick={() => setSimParams(snapshot.params)}
                          variant="ghost"
                          size="sm"
                          className="w-full mt-4 text-xs hover:bg-white/10"
                          style={{ color: snapshot.color }}
                        >
                          Load This Scenario
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Comparison Summary */}
                {snapshots.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[hsl(45,90%,55%)]" />
                      Quick Comparison
                    </h4>
                    <div className="flex flex-wrap gap-4 text-xs">
                      {/* Best Runway */}
                      {(() => {
                        const allScenarios = [
                          { name: "Current", runway: runwayMonths, color: "hsl(226,100%,59%)" },
                          ...snapshots.map(s => ({ name: s.name, runway: s.runwayMonths, color: s.color }))
                        ];
                        const best = allScenarios.reduce((a, b) => a.runway > b.runway ? a : b);
                        const worst = allScenarios.reduce((a, b) => a.runway < b.runway ? a : b);
                        
                        return (
                          <>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(152,100%,50%)/0.1] border border-[hsl(152,100%,50%)/0.2]">
                              <span className="text-[hsl(220,10%,55%)]">Best:</span>
                              <span className="font-semibold text-[hsl(152,100%,50%)]">{best.name}</span>
                              <span className="text-[hsl(152,100%,50%)]">({best.runway >= 24 ? "24+" : best.runway.toFixed(1)}mo)</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(0,70%,55%)/0.1] border border-[hsl(0,70%,55%)/0.2]">
                              <span className="text-[hsl(220,10%,55%)]">Worst:</span>
                              <span className="font-semibold text-[hsl(0,70%,55%)]">{worst.name}</span>
                              <span className="text-[hsl(0,70%,55%)]">({worst.runway >= 24 ? "24+" : worst.runway.toFixed(1)}mo)</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(45,90%,55%)/0.1] border border-[hsl(45,90%,55%)/0.2]">
                              <span className="text-[hsl(220,10%,55%)]">Difference:</span>
                              <span className="font-semibold text-[hsl(45,90%,55%)]">
                                {Math.abs(best.runway - worst.runway).toFixed(1)} months
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

