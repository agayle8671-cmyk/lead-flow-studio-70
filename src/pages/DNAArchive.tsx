import { forwardRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Archive, Calendar, TrendingUp, TrendingDown, FileText, Search, ArrowUpDown, 
  ArrowRight, Minus, ChevronUp, ChevronDown, GitCompare, Activity, 
  Filter, X, FlaskConical, Sparkles, Clock, Dna, SortDesc, Flame, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiUrl } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  DollarSign,
  Wallet,
  PiggyBank,
  Target,
  BarChart3,
  Percent,
  TrendingDown as TrendingDownIcon,
  Zap,
  Shield,
  AlertTriangle,
  Crown,
  Award,
  Medal
} from "lucide-react";

// Types of metric modals
type StatsModalType = "total" | "average" | "last" | null;
type MetricModalType = "cash" | "burn" | "margin" | null;

interface Analysis {
  id: number;
  date: string;
  runway: number;
  grade: string;
  change: string;
  trend: "up" | "down";
  // optional details (available from API)
  monthlyBurn?: number;
  cashOnHand?: number;
  profitMargin?: number;
  insight?: string;
  companyName?: string;  // Added for Deep Search
  // Simulation-specific fields
  entryType?: "ANALYSIS" | "SIMULATION";
  scenarioA?: {
    cash_on_hand: number;
    monthly_expenses: number;
    monthly_revenue: number;
    expense_growth: number;
    revenue_growth: number;
    runway_months: number;
  };
  scenarioB?: {
    cash_on_hand: number;
    monthly_expenses: number;
    monthly_revenue: number;
    expense_growth: number;
    revenue_growth: number;
    runway_months: number;
  };
  hiringPlan?: {
    id: string;
    title: string;
    salary: number;
    count: number;
    start_month: number;
  }[];
  runwayDelta?: number;
  totalNewHires?: number;
  hiringBurnImpact?: number;
}

const mockAnalyses: Analysis[] = [
  { 
    id: 1, 
    date: "Dec 28, 2025", 
    runway: 18.4, 
    grade: "A", 
    change: "+2.1", 
    trend: "up",
    monthlyBurn: 42500,
    cashOnHand: 782300,
    profitMargin: 24.7,
    insight: "Elite burn efficiency detected. You're in the top 12% of funded startups. Classification: Blitzscaler.",
    companyName: "My Startup"
  },
  { 
    id: 2, 
    date: "Nov 30, 2025", 
    runway: 16.3, 
    grade: "A", 
    change: "+1.8", 
    trend: "up",
    monthlyBurn: 45000,
    cashOnHand: 733500,
    profitMargin: 22.1,
    insight: "Strong revenue growth trajectory. Consider accelerating customer acquisition.",
    companyName: "My Startup"
  },
  { 
    id: 3, 
    date: "Oct 31, 2025", 
    runway: 14.5, 
    grade: "B", 
    change: "-0.5", 
    trend: "down",
    monthlyBurn: 48200,
    cashOnHand: 698900,
    profitMargin: 18.5,
    insight: "Slight dip in efficiency. Monitor expense growth closely this quarter.",
    companyName: "My Startup"
  },
  { 
    id: 4, 
    date: "Sep 30, 2025", 
    runway: 15.0, 
    grade: "B", 
    change: "+0.8", 
    trend: "up",
    monthlyBurn: 46800,
    cashOnHand: 702000,
    profitMargin: 19.2,
    insight: "Healthy position with room for growth investment.",
    companyName: "My Startup"
  },
  { 
    id: 5, 
    date: "Aug 31, 2025", 
    runway: 14.2, 
    grade: "B", 
    change: "+1.2", 
    trend: "up",
    monthlyBurn: 47500,
    cashOnHand: 674500,
    profitMargin: 17.8,
    insight: "Post-funding stabilization complete. Ready for scaling phase.",
    companyName: "My Startup"
  },
];

type SortField = "date" | "grade" | "runway" | "runway_desc" | "burn_efficiency";

// Sort options with labels and icons
const SORT_OPTIONS: { value: SortField; label: string; description: string }[] = [
  { value: "date", label: "Most Recent", description: "Newest first" },
  { value: "runway_desc", label: "Runway (High → Low)", description: "Longest runway first" },
  { value: "runway", label: "Runway (Low → High)", description: "Shortest runway first" },
  { value: "burn_efficiency", label: "Burn Efficiency", description: "Best efficiency first" },
  { value: "grade", label: "By Grade", description: "A → F" },
];

// Get unique months from analyses for filter dropdown
const getUniqueMonths = (analyses: Analysis[]): string[] => {
  const months = new Set<string>();
  analyses.forEach(a => {
    const date = new Date(a.date);
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.add(monthYear);
  });
  return Array.from(months);
};

const GRADE_OPTIONS = ["All", "A", "B", "C", "D", "F"] as const;

const DNAArchive = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [isLoading, setIsLoading] = useState(false);

  // Deep Search Filters
  const [showDeepSearch, setShowDeepSearch] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [monthFilter, setMonthFilter] = useState<string>("All");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  // Stats & Metric Modal State
  const [statsModalOpen, setStatsModalOpen] = useState<StatsModalType>(null);
  const [metricModalOpen, setMetricModalOpen] = useState<MetricModalType>(null);

  // Get unique months for filter
  const uniqueMonths = useMemo(() => getUniqueMonths(analyses), [analyses]);

  // ═══════════════════════════════════════════════════════════════════════════
  // REHYDRATION HOOK - Load simulation back into Toolkit
  // ═══════════════════════════════════════════════════════════════════════════
  const rehydrateSimulation = (analysis: Analysis) => {
    if (analysis.entryType !== "SIMULATION") {
      // For regular analyses, use the existing rehydration
      rehydrateDNALab(analysis);
      return;
    }
    
    // Store simulation data for Toolkit to pick up
    const simulationData = {
      simParams: analysis.scenarioA ? {
        cashOnHand: analysis.scenarioA.cash_on_hand,
        monthlyExpenses: analysis.scenarioA.monthly_expenses,
        monthlyRevenue: analysis.scenarioA.monthly_revenue,
        expenseGrowth: analysis.scenarioA.expense_growth,
        revenueGrowth: analysis.scenarioA.revenue_growth,
      } : null,
      scenarioB: analysis.scenarioB ? {
        cashOnHand: analysis.scenarioB.cash_on_hand,
        monthlyExpenses: analysis.scenarioB.monthly_expenses,
        monthlyRevenue: analysis.scenarioB.monthly_revenue,
        expenseGrowth: analysis.scenarioB.expense_growth,
        revenueGrowth: analysis.scenarioB.revenue_growth,
      } : null,
      hiringPlan: analysis.hiringPlan || [],
      scenarioMode: !!analysis.scenarioB,
      date: analysis.date,
    };
    
    sessionStorage.setItem("runwayDNA_simulation", JSON.stringify(simulationData));
    
    toast({
      title: "Simulation Snapshot Loading",
      description: `Restoring strategic scenario from ${analysis.date}...`,
    });
    
    // Navigate to Toolkit
    navigate("/toolkit?simulation=true");
  };

  // Fetch from API on mount + merge local simulations
  useEffect(() => {
    const fetchArchive = async () => {
      setIsLoading(true);
      try {
        // Also load locally-stored simulations
        const localSimulations = JSON.parse(localStorage.getItem("runwayDNA_simulations") || "[]");
        
        const response = await fetch(apiUrl("/api/archive"));
        if (response.ok) {
          const data = await response.json();
          const allData = [...localSimulations, ...data]; // Merge local + API
          
          if (allData.length > 0) {
            const mapped = allData.map((item: any, index: number) => {
              // Parse date properly
              const dateObj = new Date(item.date || item.created_at);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              // Parse runway - API returns it as a string
              const runwayValue = parseFloat(item.runway) || 0;

              // Calculate change from previous if exists
              const prevItem = data[index + 1];
              const prevRunway = prevItem ? parseFloat(prevItem.runway) || 0 : runwayValue;
              const change = runwayValue - prevRunway;

              return {
                id: item.id || index + 1,
                date: formattedDate,
                runway: runwayValue,
                grade: item.grade || "B",
                change: change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1),
                trend: (change >= 0 ? "up" : "down") as "up" | "down",
                monthlyBurn: item.monthlyBurn ? Number(item.monthlyBurn) : undefined,
                cashOnHand: item.cashOnHand ? Number(item.cashOnHand) : undefined,
                profitMargin: item.profitMargin ? Number(item.profitMargin) : undefined,
                insight: item.insight || undefined,
                companyName: item.companyName || item.company_name || "My Startup",
                // Simulation-specific fields
                entryType: item.entry_type || "ANALYSIS",
                scenarioA: item.scenario_a,
                scenarioB: item.scenario_b,
                hiringPlan: item.hiring_plan,
                runwayDelta: item.runway_delta,
                totalNewHires: item.total_new_hires,
                hiringBurnImpact: item.hiring_burn_impact,
              } satisfies Analysis;
            });
            setAnalyses(mapped);
          }
        }
      } catch (error) {
        console.log("Archive fetch error:", error);
        // Load local simulations even if API unavailable
        const localSimulations = JSON.parse(localStorage.getItem("runwayDNA_simulations") || "[]");
        if (localSimulations.length > 0) {
          const mapped = localSimulations.map((item: any, index: number) => {
            const dateObj = new Date(item.date || item.created_at);
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const runwayValue = parseFloat(item.runway) || 0;
            return {
              id: item.id || `sim-${index}`,
              date: formattedDate,
              runway: runwayValue,
              grade: item.grade || "B",
              change: "+0.0",
              trend: "up" as const,
              insight: item.insight,
              entryType: item.entry_type || "SIMULATION",
              scenarioA: item.scenario_a,
              scenarioB: item.scenario_b,
              hiringPlan: item.hiring_plan,
              runwayDelta: item.runway_delta,
              totalNewHires: item.total_new_hires,
            } satisfies Analysis;
          });
          setAnalyses([...mapped, ...mockAnalyses]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchive();
  }, []);

  const getGradeClass = (grade: string) => {
    const g = grade.toLowerCase();
    if (g === "a") return "bg-[#22C55E] text-[hsl(152,100%,5%)]";
    if (g === "b") return "bg-[hsl(226,100%,59%)] text-white";
    return "bg-[hsl(45,90%,55%)] text-[hsl(45,100%,10%)]";
  };

  const handleViewAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setDetailOpen(true);
  };

  // Get previous analysis for comparison
  const getPreviousAnalysis = (current: Analysis): Analysis | null => {
    const currentIndex = analyses.findIndex(a => a.id === current.id);
    if (currentIndex < analyses.length - 1) {
      return analyses[currentIndex + 1];
    }
    return null;
  };

  // Calculate diff between two values
  const getDiff = (current: number | undefined, previous: number | undefined): { value: number; percent: number; trend: "up" | "down" | "same" } | null => {
    if (current === undefined || previous === undefined) return null;
    const diff = current - previous;
    const percent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    return {
      value: diff,
      percent,
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "same"
    };
  };

  const handleSort = (field: SortField) => {
    setSortField(field);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DEEP SEARCH & FILTERING ENGINE
  // Real-time, case-insensitive search across company_name, grade, insight
  // Works in tandem with Grade and Month dropdown filters
  // ═══════════════════════════════════════════════════════════════════════════
  const filteredAnalyses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return analyses.filter(a => {
      // ═══ TEXT SEARCH (case-insensitive) ═══
      // Searches across: company_name, grade, insight, date, runway, burn, cash
      let matchesSearch = true;
      if (query) {
        const searchableText = [
          // Primary search fields
          a.companyName || "",
          a.grade,
          a.insight || "",
          // Secondary search fields
          a.date,
          `${a.runway}`,
          `${a.runway} months`,
          `runway ${a.runway}`,
          `grade ${a.grade}`,
          // Financial data
          a.monthlyBurn ? `burn $${a.monthlyBurn.toLocaleString()}` : "",
          a.monthlyBurn ? `${a.monthlyBurn}` : "",
          a.cashOnHand ? `cash $${a.cashOnHand.toLocaleString()}` : "",
          a.cashOnHand ? `${a.cashOnHand}` : "",
          a.profitMargin ? `margin ${a.profitMargin}%` : "",
          // Keywords from insight for fuzzy matching
          a.insight?.includes("Elite") ? "top performer blitzscaler" : "",
          a.insight?.includes("Strong") ? "growth trajectory scaling" : "",
          a.insight?.includes("Slight") ? "attention monitor caution" : "",
          a.insight?.includes("Healthy") ? "good position stable" : "",
        ].join(" ").toLowerCase();
        
        // Split query into words for multi-term search
        const queryTerms = query.split(/\s+/);
        matchesSearch = queryTerms.every(term => searchableText.includes(term));
      }
      
      // ═══ GRADE FILTER (A-F) ═══
      // Works in tandem with search - both must match
      const matchesGrade = gradeFilter === "All" || 
        a.grade.toUpperCase() === gradeFilter.toUpperCase();
      
      // ═══ MONTH FILTER ═══
      // Filters by specific month/year combination
      let matchesMonth = true;
      if (monthFilter !== "All") {
        try {
          const analysisDate = new Date(a.date);
          const analysisMonthYear = analysisDate.toLocaleDateString("en-US", { 
            month: "long", 
            year: "numeric" 
          });
          matchesMonth = analysisMonthYear === monthFilter;
        } catch {
          matchesMonth = false;
        }
      }
      
      // ALL filters must pass (AND logic)
      return matchesSearch && matchesGrade && matchesMonth;
    });
  }, [analyses, searchQuery, gradeFilter, monthFilter]);

  // Calculate burn efficiency (runway / burn rate - higher is better)
  const calculateBurnEfficiency = (analysis: Analysis): number => {
    if (!analysis.monthlyBurn || analysis.monthlyBurn === 0) return analysis.runway;
    if (!analysis.cashOnHand) return analysis.runway;
    // Efficiency = runway months * (1 - burn ratio)
    return analysis.runway * (analysis.cashOnHand / (analysis.monthlyBurn * 12));
  };

  // Sort analyses based on current sort field
  const sortedAnalyses = useMemo(() => {
    const toSort = [...filteredAnalyses];
    
    switch (sortField) {
      case "date":
        return toSort.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "grade":
        return toSort.sort((a, b) => a.grade.localeCompare(b.grade));
      case "runway":
        return toSort.sort((a, b) => a.runway - b.runway);
      case "runway_desc":
        return toSort.sort((a, b) => b.runway - a.runway);
      case "burn_efficiency":
        return toSort.sort((a, b) => calculateBurnEfficiency(b) - calculateBurnEfficiency(a));
      default:
        return toSort;
    }
  }, [filteredAnalyses, sortField]);

  // Check if any filters are active
  const hasActiveFilters = gradeFilter !== "All" || monthFilter !== "All" || searchQuery !== "";

  // Clear all filters
  const clearFilters = () => {
    setGradeFilter("All");
    setMonthFilter("All");
    setSearchQuery("");
  };

  // Rehydrate DNA Lab with historical data
  const rehydrateDNALab = (analysis: Analysis) => {
    // Store the historical data in sessionStorage for DNA Lab to pick up
    const historicalData = {
      runway_months: analysis.runway,
      grade: analysis.grade,
      monthly_burn: analysis.monthlyBurn || 0,
      cash_on_hand: analysis.cashOnHand || 0,
      profit_margin: analysis.profitMargin || 0,
      revenue_trend: [40, 45, 50, 55, 60, 65, 70], // Default if not available
      expense_trend: [35, 38, 40, 42, 45, 48, 52],
      insight: analysis.insight || `Historical snapshot from ${analysis.date}`,
      isHistorical: true,
      historicalDate: analysis.date,
    };
    
    sessionStorage.setItem("runwayDNA_historical", JSON.stringify(historicalData));
    
    toast({
      title: "Time Machine Activated",
      description: `Loading your financial DNA from ${analysis.date}...`,
    });
    
    // Navigate to DNA Lab
    navigate("/?historical=true");
  };

  const stats = {
    total: analyses.length,
    avgRunway: analyses.length > 0 ? (analyses.reduce((sum, a) => sum + a.runway, 0) / analyses.length).toFixed(1) : "0",
    lastAnalysis: analyses.length > 0 ? "3d" : "N/A",
  };

  return (
    <div ref={ref} className="min-h-screen w-full p-8">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient-cobalt mb-1">DNA Archive</h1>
            <p className="text-[hsl(220,10%,50%)] text-sm">Your financial evolution, tracked over time</p>
          </div>
          <Button
            onClick={() => setShowDeepSearch(!showDeepSearch)}
            variant={showDeepSearch ? "default" : "outline"}
            className={showDeepSearch 
              ? "bg-[hsl(270,60%,55%)] hover:bg-[hsl(270,60%,60%)] text-white" 
              : "border-[hsl(270,60%,55%)/0.3] hover:border-[hsl(270,60%,55%)/0.6] text-[hsl(270,60%,65%)]"
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            Deep Search
            {hasActiveFilters && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                {(gradeFilter !== "All" ? 1 : 0) + (monthFilter !== "All" ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Deep Search Panel */}
        <AnimatePresence>
          {showDeepSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)/0.1] via-[hsl(240,15%,10%)] to-[hsl(226,100%,59%)/0.1] border border-[hsl(270,60%,55%)/0.2]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(270,60%,55%)/0.2] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[hsl(270,60%,65%)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Deep Search</h3>
                    <p className="text-xs text-[hsl(220,10%,50%)]">Filter your financial history</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Grade Filter */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-2 block">
                      Filter by Grade
                    </label>
                    <div className="flex gap-1">
                      {GRADE_OPTIONS.map((grade) => (
                        <Button
                          key={grade}
                          size="sm"
                          variant={gradeFilter === grade ? "default" : "outline"}
                          onClick={() => setGradeFilter(grade)}
                          className={`flex-1 ${
                            gradeFilter === grade
                              ? grade === "A" 
                                ? "bg-[#22C55E] hover:bg-[hsl(152,100%,55%)] text-black"
                                : grade === "B"
                                ? "bg-[hsl(226,100%,59%)] hover:bg-[hsl(226,100%,65%)] text-white"
                                : grade === "C"
                                ? "bg-[hsl(45,90%,55%)] hover:bg-[hsl(45,90%,60%)] text-black"
                                : grade === "All"
                                ? "bg-[hsl(270,60%,55%)] hover:bg-[hsl(270,60%,60%)] text-white"
                                : "bg-[#DC2626] hover:bg-[hsl(0,70%,60%)] text-white"
                              : "border-white/10 hover:border-white/20 text-[hsl(220,10%,60%)]"
                          }`}
                        >
                          {grade}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Month Filter */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-2 block">
                      Filter by Month
                    </label>
                    <Select value={monthFilter} onValueChange={setMonthFilter}>
                      <SelectTrigger className="bg-[hsl(240,7%,12%)] border-white/10 text-white">
                        <Clock className="w-4 h-4 mr-2 text-[hsl(220,10%,50%)]" />
                        <SelectValue placeholder="All months" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(240,7%,12%)] border-white/10">
                        <SelectItem value="All" className="text-white hover:bg-white/5">
                          All Months
                        </SelectItem>
                        {uniqueMonths.map((month) => (
                          <SelectItem 
                            key={month} 
                            value={month}
                            className="text-white hover:bg-white/5"
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        variant="ghost"
                        className="text-[hsl(0,70%,60%)] hover:text-[hsl(0,70%,70%)] hover:bg-[#DC2626/0.1]"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filter Results Summary */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <p className="text-sm text-[rgba(255,255,255,0.5)]">
                    Showing <span className="text-white font-semibold">{sortedAnalyses.length}</span> of{" "}
                    <span className="text-white">{analyses.length}</span> analyses
                    {sortField !== "date" && (
                      <span className="ml-2 text-[hsl(270,60%,60%)]">
                        • Sorted by {SORT_OPTIONS.find(o => o.value === sortField)?.label}
                      </span>
                    )}
                  </p>
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                      {gradeFilter !== "All" && (
                        <span className="px-2 py-1 rounded-lg bg-[hsl(226,100%,59%)/0.2] text-[hsl(226,100%,68%)] text-xs">
                          Grade: {gradeFilter}
                        </span>
                      )}
                      {monthFilter !== "All" && (
                        <span className="px-2 py-1 rounded-lg bg-[hsl(270,60%,55%)/0.2] text-[hsl(270,60%,70%)] text-xs">
                          {monthFilter}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,10%,40%)]" />
            <Input
              placeholder="Search by company, grade, insight, runway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[hsl(270,15%,10%)/0.6] border-[hsl(226,100%,59%)/0.1] text-white placeholder:text-[hsl(220,10%,40%)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-[hsl(220,10%,50%)]" />
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[hsl(226,100%,59%)/0.2] hover:border-[hsl(226,100%,59%)/0.4] text-[hsl(220,10%,70%)]">
                <SortDesc className="w-4 h-4 mr-2" />
                {SORT_OPTIONS.find(o => o.value === sortField)?.label || "Sort"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[hsl(270,15%,10%)] border-[hsl(226,100%,59%)/0.2] w-56">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem 
                  key={option.value}
                  onClick={() => handleSort(option.value)} 
                  className="text-white hover:bg-[hsl(226,100%,59%)/0.1] cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-[hsl(220,10%,50%)]">{option.description}</p>
                  </div>
                  {sortField === option.value && (
                    <Check className="w-4 h-4 text-[#22C55E]" />
                  )}
              </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Analyses Card - Clickable */}
        <motion.div 
          onClick={() => setStatsModalOpen("total")}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel p-6 cursor-pointer group relative overflow-hidden transition-all hover:border-[hsl(226,100%,59%)/0.4] hover:shadow-xl hover:shadow-[hsl(226,100%,59%)/0.15]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(226,100%,59%)/0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 rounded-full bg-[hsl(226,100%,59%)/0.2] text-[10px] text-[hsl(226,100%,68%)] uppercase tracking-wider">
              Click for details
            </div>
          </div>
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.15] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Archive className="w-5 h-5 text-[hsl(226,100%,59%)]" />
            </div>
            <span className="text-[rgba(255,255,255,0.5)] text-sm">Total Analyses</span>
          </div>
          <p className="relative text-4xl font-bold text-white">{stats.total}</p>
        </motion.div>

        {/* Average Runway Card - Clickable */}
        <motion.div 
          onClick={() => setStatsModalOpen("average")}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel p-6 cursor-pointer group relative overflow-hidden transition-all hover:border-[#22C55E/0.4] hover:shadow-xl hover:shadow-[#22C55E/0.15]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E/0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 rounded-full bg-[#22C55E/0.2] text-[10px] text-[hsl(152,100%,60%)] uppercase tracking-wider">
              Click for details
        </div>
          </div>
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E/0.15] flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
            </div>
            <span className="text-[rgba(255,255,255,0.5)] text-sm">Average Runway</span>
          </div>
          <p className="relative text-4xl font-bold text-gradient-emerald">{stats.avgRunway}</p>
        </motion.div>

        {/* Last Analysis Card - Clickable */}
        <motion.div 
          onClick={() => setStatsModalOpen("last")}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel p-6 cursor-pointer group relative overflow-hidden transition-all hover:border-[hsl(270,60%,55%)/0.4] hover:shadow-xl hover:shadow-[hsl(270,60%,55%)/0.15]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(270,60%,55%)/0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 rounded-full bg-[hsl(270,60%,55%)/0.2] text-[10px] text-[hsl(270,60%,70%)] uppercase tracking-wider">
              Click for details
        </div>
          </div>
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(270,60%,50%)/0.15] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-[hsl(270,60%,55%)]" />
            </div>
            <span className="text-[rgba(255,255,255,0.5)] text-sm">Last Analysis</span>
          </div>
          <p className="relative text-4xl font-bold text-white">{stats.lastAnalysis}</p>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[hsl(226,100%,59%)]" />
            Recent Analyses
          </h2>
          <span className="text-xs text-[hsl(220,10%,50%)]">
            {sortedAnalyses.length} result{sortedAnalyses.length !== 1 ? "s" : ""}
          </span>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            HIGH-STATUS EMPTY STATE
            Appears when filters return zero results
        ═══════════════════════════════════════════════════════════════════ */}
        {sortedAnalyses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 px-8 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(270,60%,55%)/0.05] via-transparent to-[hsl(226,100%,59%)/0.05]" />
            
            {/* DNA Helix Illustration - High Status */}
            <div className="relative mb-10">
              {/* Multi-layer glow effect */}
              <div className="absolute inset-0 bg-[hsl(270,60%,55%)/0.3] blur-[80px] rounded-full scale-150" />
              <div className="absolute inset-0 bg-[hsl(226,100%,59%)/0.2] blur-[60px] rounded-full scale-125" />
              
              {/* Main DNA Container */}
              <motion.div
                className="relative w-40 h-40 rounded-[2rem] bg-gradient-to-br from-[hsl(270,60%,55%)/0.15] via-[hsl(240,15%,12%)] to-[hsl(226,100%,59%)/0.15] flex items-center justify-center border border-white/10 shadow-2xl shadow-[hsl(270,60%,55%)/0.2]"
                animate={{
                  rotateY: [0, 15, 0, -15, 0],
                  rotateX: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Inner glow */}
                <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)/0.1] to-transparent" />
                
                {/* Rotating DNA */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Dna className="w-20 h-20 text-[hsl(270,60%,60%)]" />
                </motion.div>
                
                {/* Orbiting particles with trails */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2.5 h-2.5 rounded-full"
                    style={{
                      background: [
                        "hsl(226, 100%, 59%)",
                        "hsl(152, 100%, 50%)",
                        "hsl(270, 60%, 55%)",
                        "hsl(45, 90%, 55%)",
                      ][i],
                      boxShadow: `0 0 15px 3px ${[
                        "hsl(226, 100%, 59%)",
                        "hsl(152, 100%, 50%)",
                        "hsl(270, 60%, 55%)",
                        "hsl(45, 90%, 55%)",
                      ][i]}`,
                    }}
                    animate={{
                      x: [0, 50, 0, -50, 0],
                      y: [50, 0, -50, 0, 50],
                      opacity: [0.4, 1, 0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 4,
                      delay: i * 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
                
                {/* Scanning line effect */}
                <motion.div
                  className="absolute inset-0 rounded-[2rem] overflow-hidden"
                  initial={false}
                >
                  <motion.div
                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-[hsl(270,60%,55%)/0.5] to-transparent"
                    animate={{
                      top: ["-10%", "110%"],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Title with gradient */}
            <motion.h3 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-3 text-center"
            >
              <span className="bg-gradient-to-r from-[hsl(270,60%,65%)] via-white to-[hsl(226,100%,68%)] bg-clip-text text-transparent">
                No DNA Matches Found
              </span>
            </motion.h3>
            
            {/* Contextual message */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[rgba(255,255,255,0.5)] text-center max-w-lg mb-2"
            >
              {searchQuery && gradeFilter !== "All" ? (
                <>Your search for "<span className="text-white font-medium">{searchQuery}</span>" with Grade <span className="text-[hsl(226,100%,68%)] font-medium">{gradeFilter}</span> returned no results.</>
              ) : searchQuery ? (
                <>No analyses match "<span className="text-white font-medium">{searchQuery}</span>"</>
              ) : gradeFilter !== "All" && monthFilter !== "All" ? (
                <>No Grade <span className="text-[hsl(226,100%,68%)] font-medium">{gradeFilter}</span> analyses found in <span className="text-[hsl(270,60%,65%)] font-medium">{monthFilter}</span></>
              ) : gradeFilter !== "All" ? (
                <>No analyses with Grade <span className="text-[hsl(226,100%,68%)] font-medium">{gradeFilter}</span> found</>
              ) : monthFilter !== "All" ? (
                <>No analyses found for <span className="text-[hsl(270,60%,65%)] font-medium">{monthFilter}</span></>
              ) : (
                <>No analyses match your current filters</>
              )}
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-[rgba(255,255,255,0.4)] text-sm text-center max-w-md mb-8"
            >
              Try adjusting your search terms, changing the grade filter, or selecting a different month.
            </motion.p>
            
            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4"
            >
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(270,60%,50%)] hover:from-[hsl(270,60%,60%)] hover:to-[hsl(270,60%,55%)] text-white shadow-lg shadow-[hsl(270,60%,55%)/0.3]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-[hsl(226,100%,59%)/0.3] hover:border-[hsl(226,100%,59%)] text-[hsl(226,100%,68%)] hover:bg-[hsl(226,100%,59%)/0.1]"
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Run New Analysis
              </Button>
            </motion.div>
            
            {/* Filter summary chips */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center gap-2"
              >
                <span className="text-xs text-[rgba(255,255,255,0.4)]">Active filters:</span>
                {searchQuery && (
                  <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white border border-white/10">
                    "{searchQuery}"
                  </span>
                )}
                {gradeFilter !== "All" && (
                  <span className="px-2 py-1 rounded-lg bg-[hsl(226,100%,59%)/0.15] text-xs text-[hsl(226,100%,68%)] border border-[hsl(226,100%,59%)/0.3]">
                    Grade {gradeFilter}
                  </span>
                )}
                {monthFilter !== "All" && (
                  <span className="px-2 py-1 rounded-lg bg-[hsl(270,60%,55%)/0.15] text-xs text-[hsl(270,60%,65%)] border border-[hsl(270,60%,55%)/0.3]">
                    {monthFilter}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Animated List with staggerChildren */
          <motion.div 
            className="divide-y divide-white/5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            <AnimatePresence mode="popLayout">
              {sortedAnalyses.map((analysis) => (
            <motion.div
              key={analysis.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, x: -30, scale: 0.95 },
                    visible: { opacity: 1, x: 0, scale: 1 },
                  }}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    layout: { duration: 0.3 }
                  }}
              onClick={() => handleViewAnalysis(analysis)}
              className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleViewAnalysis(analysis);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-xl ${getGradeClass(analysis.grade)} flex items-center justify-center font-bold text-lg uppercase shadow-lg`}
                        style={{
                          boxShadow: analysis.grade.toLowerCase() === 'a' 
                            ? '0 4px 15px hsl(152, 100%, 50%, 0.3)' 
                            : analysis.grade.toLowerCase() === 'b'
                            ? '0 4px 15px hsl(226, 100%, 59%, 0.3)'
                            : '0 4px 15px hsl(45, 90%, 55%, 0.3)'
                        }}
                  >
                    {analysis.grade}
                      </motion.div>
                  <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium group-hover:text-[hsl(226,100%,68%)] transition-colors">{analysis.date}</p>
                          {/* SIMULATION Badge */}
                          {analysis.entryType === "SIMULATION" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(270,60%,55%)/0.2] border border-[hsl(270,60%,55%)/0.3]">
                              <FlaskConical className="w-3 h-3 text-[hsl(270,60%,60%)]" />
                              <span className="text-[10px] font-semibold text-[hsl(270,60%,65%)] uppercase">Simulation</span>
                            </span>
                          )}
                        </div>
                    <p className="text-[hsl(220,10%,50%)] text-sm">
                          {analysis.runway.toFixed(1)} months runway
                          {analysis.entryType === "SIMULATION" && analysis.totalNewHires && analysis.totalNewHires > 0 && (
                            <span className="text-[hsl(45,90%,55%)] ml-2">• {analysis.totalNewHires} planned hire{analysis.totalNewHires > 1 ? 's' : ''}</span>
                          )}
                          {analysis.entryType === "SIMULATION" && analysis.runwayDelta !== undefined && (
                            <span className={`ml-2 ${analysis.runwayDelta >= 0 ? "text-[#22C55E]" : "text-[#DC2626]"}`}>
                              • Δ {analysis.runwayDelta >= 0 ? "+" : ""}{analysis.runwayDelta.toFixed(1)}mo
                            </span>
                          )}
                          {analysis.entryType !== "SIMULATION" && analysis.insight && (
                            <span className="text-[hsl(270,60%,60%)] ml-2">• Has insight</span>
                          )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                      {/* Burn Efficiency Indicator */}
                      {analysis.monthlyBurn && analysis.monthlyBurn > 0 && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-[hsl(220,10%,50%)]">
                          <Flame className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                          ${(analysis.monthlyBurn / 1000).toFixed(0)}k/mo
                        </div>
                      )}
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${analysis.trend === "up" ? "text-[#22C55E]" : "text-[#DC2626]"}`}
                  >
                    <TrendingUp className={`w-4 h-4 ${analysis.trend === "down" ? "rotate-180" : ""}`} />
                    {analysis.change} months
                  </div>
                      <ArrowRight className="w-4 h-4 text-[hsl(220,10%,30%)] group-hover:text-[hsl(226,100%,59%)] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Stunning Analysis Detail Modal */}
      {detailOpen && selectedAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setDetailOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-[hsl(226,100%,59%)/0.2] shadow-2xl shadow-[hsl(226,100%,59%)/0.1]"
          >
            {/* Header with Glow */}
            <div className="relative p-8 pb-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(226,100%,59%)/0.1] via-transparent to-[#22C55E/0.1]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-[hsl(226,100%,59%)/0.15] blur-[80px] rounded-full" />
              
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative flex items-center gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl ${getGradeClass(selectedAnalysis.grade)} flex items-center justify-center shadow-lg ${selectedAnalysis.grade.toLowerCase() === 'a' ? 'shadow-[#22C55E/0.3]' : selectedAnalysis.grade.toLowerCase() === 'b' ? 'shadow-[hsl(226,100%,59%)/0.3]' : 'shadow-[hsl(45,90%,55%)/0.3]'}`}>
                  <span className="text-3xl font-bold">{selectedAnalysis.grade}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedAnalysis.date}</h2>
                  <p className="text-[rgba(255,255,255,0.5)]">Financial DNA Snapshot</p>
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E/0.08] via-[hsl(180,80%,45%)/0.05] to-[hsl(226,100%,59%)/0.08]" />
                <div className="absolute inset-0 backdrop-blur-xl bg-[hsl(240,7%,8%)/0.6]" />
                
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Runway Display */}
                  <div className="text-center md:text-left">
                    <p className="text-[rgba(255,255,255,0.5)] text-sm uppercase tracking-wider mb-2">Runway at Time</p>
                    <div className="flex items-baseline gap-2">
                      <motion.span 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="text-7xl font-bold font-mono"
                        style={{ color: selectedAnalysis.runway >= 12 ? "hsl(152, 100%, 50%)" : selectedAnalysis.runway >= 6 ? "hsl(45, 90%, 55%)" : "hsl(0, 70%, 55%)" }}
                      >
                        {selectedAnalysis.runway.toFixed(1)}
                      </motion.span>
                      <span className="text-2xl text-[hsl(220,10%,50%)]">months</span>
                    </div>
                    <div className={`flex items-center gap-2 mt-3 ${selectedAnalysis.trend === "up" ? "text-[#22C55E]" : "text-[#DC2626]"}`}>
                      <TrendingUp className={`w-5 h-5 ${selectedAnalysis.trend === "down" ? "rotate-180" : ""}`} />
                      <span className="font-semibold">{selectedAnalysis.change} from previous</span>
                    </div>
                  </div>

                  {/* Grade Badge */}
                  <motion.div
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 blur-2xl opacity-40" style={{ background: selectedAnalysis.grade.toLowerCase() === 'a' ? 'hsl(152, 100%, 50%)' : selectedAnalysis.grade.toLowerCase() === 'b' ? 'hsl(226, 100%, 59%)' : 'hsl(45, 90%, 55%)' }} />
                    <div className={`relative w-24 h-24 rounded-2xl ${getGradeClass(selectedAnalysis.grade)} flex items-center justify-center font-bold text-5xl shadow-xl`}>
                      {selectedAnalysis.grade}
                    </div>
                  </motion.div>
                </div>

                {/* Runway Progress Bar */}
                <div className="relative mt-8">
                  <div className="h-3 rounded-full bg-[hsl(240,7%,15%)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((selectedAnalysis.runway / 24) * 100, 100)}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ 
                        background: selectedAnalysis.runway >= 12 
                          ? "linear-gradient(90deg, hsl(152, 100%, 50%), hsl(180, 80%, 45%))" 
                          : selectedAnalysis.runway >= 6 
                            ? "linear-gradient(90deg, hsl(45, 90%, 55%), hsl(30, 80%, 50%))"
                            : "linear-gradient(90deg, hsl(0, 70%, 55%), hsl(15, 80%, 50%))"
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-[rgba(255,255,255,0.4)]">
                    <span>0</span>
                    <span>6 mo</span>
                    <span>12 mo</span>
                    <span>18 mo</span>
                    <span>24+ mo</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Metrics Grid - 3 columns for horizontal layout - CLICKABLE */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-8 pb-6 grid grid-cols-3 gap-4"
            >
              {/* Cash on Hand - Clickable */}
              <motion.div 
                onClick={() => setMetricModalOpen("cash")}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="p-5 rounded-2xl bg-[#22C55E/0.08] border border-[#22C55E/0.2] cursor-pointer group relative overflow-hidden transition-all hover:border-[#22C55E/0.5] hover:shadow-lg hover:shadow-[#22C55E/0.2]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E/0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-4 h-4 text-[hsl(152,100%,60%)]" />
                </div>
                <div className="relative flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#22C55E/0.2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[hsl(152,100%,60%)]">Cash on Hand</span>
                </div>
                <p className="relative text-3xl font-bold text-white">
                  {typeof selectedAnalysis.cashOnHand === "number" ? `$${selectedAnalysis.cashOnHand.toLocaleString()}` : "—"}
                </p>
              </motion.div>

              {/* Monthly Burn - Clickable */}
              <motion.div 
                onClick={() => setMetricModalOpen("burn")}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="p-5 rounded-2xl bg-[#DC2626/0.08] border border-[#DC2626/0.2] cursor-pointer group relative overflow-hidden transition-all hover:border-[#DC2626/0.5] hover:shadow-lg hover:shadow-[#DC2626/0.2]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626/0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Flame className="w-4 h-4 text-[hsl(0,70%,65%)]" />
                </div>
                <div className="relative flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DC2626/0.2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-[#DC2626] rotate-180" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[hsl(0,70%,65%)]">Monthly Burn</span>
                </div>
                <p className="relative text-3xl font-bold text-white">
                  {typeof selectedAnalysis.monthlyBurn === "number" ? `$${selectedAnalysis.monthlyBurn.toLocaleString()}` : "—"}
                </p>
              </motion.div>

              {/* Profit Margin - Clickable */}
              <motion.div 
                onClick={() => setMetricModalOpen("margin")}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="p-5 rounded-2xl bg-[hsl(226,100%,59%)/0.08] border border-[hsl(226,100%,59%)/0.2] cursor-pointer group relative overflow-hidden transition-all hover:border-[hsl(226,100%,59%)/0.5] hover:shadow-lg hover:shadow-[hsl(226,100%,59%)/0.2]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(226,100%,59%)/0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Percent className="w-4 h-4 text-[hsl(226,100%,68%)]" />
                </div>
                <div className="relative flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-[hsl(226,100%,68%)]" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[hsl(226,100%,68%)]">Profit Margin</span>
                </div>
                <p className="relative text-3xl font-bold text-white">
                  {selectedAnalysis.profitMargin !== undefined ? `${selectedAnalysis.profitMargin}%` : "—"}
                </p>
              </motion.div>
            </motion.div>

            {/* Comparison Section */}
            {(() => {
              const previousAnalysis = getPreviousAnalysis(selectedAnalysis);
              if (!previousAnalysis) return null;

              const runwayDiff = getDiff(selectedAnalysis.runway, previousAnalysis.runway);
              const burnDiff = getDiff(selectedAnalysis.monthlyBurn, previousAnalysis.monthlyBurn);
              const cashDiff = getDiff(selectedAnalysis.cashOnHand, previousAnalysis.cashOnHand);

              return (
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="px-8 pb-6"
                >
                  <div className="relative p-6 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,80%,45%)/0.08] via-[hsl(200,70%,50%)/0.05] to-[hsl(220,80%,55%)/0.08]" />
                    <div className="absolute inset-0 backdrop-blur-xl bg-[hsl(240,7%,8%)/0.4]" />
                    <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-[hsl(180,80%,45%)/0.15] blur-[60px] rounded-full" />
                    
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(180,80%,45%)] to-[hsl(200,70%,50%)] flex items-center justify-center shadow-lg shadow-[hsl(180,80%,45%)/0.3]">
                          <GitCompare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Comparison with Previous</h3>
                          <p className="text-[rgba(255,255,255,0.5)] text-sm">{previousAnalysis.date}</p>
                        </div>
                      </div>

                      {/* Comparison Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Runway Comparison */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="p-4 rounded-2xl bg-[rgba(20,20,20,0.6)] border border-white/5"
                        >
                          <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-2">Runway</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center">
                              <p className="text-xs text-[rgba(255,255,255,0.4)]">Previous</p>
                              <p className="text-lg font-bold text-[hsl(220,10%,65%)]">{previousAnalysis.runway.toFixed(1)}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[hsl(180,80%,50%)]" />
                            <div className="text-center">
                              <p className="text-xs text-[rgba(255,255,255,0.4)]">Current</p>
                              <p className="text-lg font-bold text-white">{selectedAnalysis.runway.toFixed(1)}</p>
                            </div>
                          </div>
                          {runwayDiff && (
                            <div className={`flex items-center justify-center gap-1 py-2 rounded-xl ${runwayDiff.trend === "up" ? "bg-[#22C55E/0.15]" : runwayDiff.trend === "down" ? "bg-[#DC2626/0.15]" : "bg-[hsl(220,10%,20%)]"}`}>
                              {runwayDiff.trend === "up" ? (
                                <ChevronUp className="w-4 h-4 text-[#22C55E]" />
                              ) : runwayDiff.trend === "down" ? (
                                <ChevronDown className="w-4 h-4 text-[#DC2626]" />
                              ) : (
                                <Minus className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
                              )}
                              <span className={`text-sm font-semibold ${runwayDiff.trend === "up" ? "text-[#22C55E]" : runwayDiff.trend === "down" ? "text-[#DC2626]" : "text-[rgba(255,255,255,0.5)]"}`}>
                                {runwayDiff.value > 0 ? "+" : ""}{runwayDiff.value.toFixed(1)} mo
                              </span>
                            </div>
                          )}
                        </motion.div>

                        {/* Cash Comparison */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.55 }}
                          className="p-4 rounded-2xl bg-[rgba(20,20,20,0.6)] border border-white/5"
                        >
                          <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-2">Cash</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center">
                              <p className="text-xs text-[rgba(255,255,255,0.4)]">Previous</p>
                              <p className="text-lg font-bold text-[hsl(220,10%,65%)]">
                                {previousAnalysis.cashOnHand ? `$${(previousAnalysis.cashOnHand / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[hsl(180,80%,50%)]" />
                            <div className="text-center">
                              <p className="text-xs text-[rgba(255,255,255,0.4)]">Current</p>
                              <p className="text-lg font-bold text-white">
                                {selectedAnalysis.cashOnHand ? `$${(selectedAnalysis.cashOnHand / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                          </div>
                          {cashDiff && (
                            <div className={`flex items-center justify-center gap-1 py-2 rounded-xl ${cashDiff.trend === "up" ? "bg-[#22C55E/0.15]" : cashDiff.trend === "down" ? "bg-[#DC2626/0.15]" : "bg-[hsl(220,10%,20%)]"}`}>
                              {cashDiff.trend === "up" ? (
                                <ChevronUp className="w-4 h-4 text-[#22C55E]" />
                              ) : cashDiff.trend === "down" ? (
                                <ChevronDown className="w-4 h-4 text-[#DC2626]" />
                              ) : (
                                <Minus className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
                              )}
                              <span className={`text-sm font-semibold ${cashDiff.trend === "up" ? "text-[#22C55E]" : cashDiff.trend === "down" ? "text-[#DC2626]" : "text-[rgba(255,255,255,0.5)]"}`}>
                                {cashDiff.percent > 0 ? "+" : ""}{cashDiff.percent.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </motion.div>

                        {/* Burn Comparison */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="p-4 rounded-2xl bg-[rgba(20,20,20,0.6)] border border-white/5"
                        >
                          <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-2">Burn Rate</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center">
                              <p className="text-xs text-[rgba(255,255,255,0.4)]">Previous</p>
                              <p className="text-lg font-bold text-[hsl(220,10%,65%)]">
                                {previousAnalysis.monthlyBurn ? `$${(previousAnalysis.monthlyBurn / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[hsl(180,80%,50%)]" />
                            <div className="text-center">
                              <p className="text-xs text-[rgba(255,255,255,0.4)]">Current</p>
                              <p className="text-lg font-bold text-white">
                                {selectedAnalysis.monthlyBurn ? `$${(selectedAnalysis.monthlyBurn / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                          </div>
                          {burnDiff && (
                            <div className={`flex items-center justify-center gap-1 py-2 rounded-xl ${burnDiff.trend === "down" ? "bg-[#22C55E/0.15]" : burnDiff.trend === "up" ? "bg-[#DC2626/0.15]" : "bg-[hsl(220,10%,20%)]"}`}>
                              {burnDiff.trend === "down" ? (
                                <ChevronDown className="w-4 h-4 text-[#22C55E]" />
                              ) : burnDiff.trend === "up" ? (
                                <ChevronUp className="w-4 h-4 text-[#DC2626]" />
                              ) : (
                                <Minus className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
                              )}
                              <span className={`text-sm font-semibold ${burnDiff.trend === "down" ? "text-[#22C55E]" : burnDiff.trend === "up" ? "text-[#DC2626]" : "text-[rgba(255,255,255,0.5)]"}`}>
                                {burnDiff.percent > 0 ? "+" : ""}{burnDiff.percent.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Grade Evolution */}
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.65 }}
                        className="mt-4 p-4 rounded-2xl bg-[rgba(20,20,20,0.6)] border border-white/5"
                      >
                        <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-3">Grade Evolution</p>
                        <div className="flex items-center justify-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Previous</p>
                            <div className={`w-14 h-14 rounded-xl ${getGradeClass(previousAnalysis.grade)} flex items-center justify-center font-bold text-2xl opacity-60`}>
                              {previousAnalysis.grade}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <ArrowRight className="w-8 h-8 text-[hsl(180,80%,50%)]" />
                            {previousAnalysis.grade !== selectedAnalysis.grade && (
                              <span className={`text-xs font-semibold mt-1 ${selectedAnalysis.grade < previousAnalysis.grade ? "text-[#22C55E]" : "text-[#DC2626]"}`}>
                                {selectedAnalysis.grade < previousAnalysis.grade ? "Improved!" : "Declined"}
                              </span>
                            )}
                            {previousAnalysis.grade === selectedAnalysis.grade && (
                              <span className="text-xs font-semibold mt-1 text-[rgba(255,255,255,0.5)]">
                                Maintained
                              </span>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Current</p>
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.7, type: "spring" }}
                              className={`w-14 h-14 rounded-xl ${getGradeClass(selectedAnalysis.grade)} flex items-center justify-center font-bold text-2xl shadow-lg`}
                            >
                              {selectedAnalysis.grade}
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Runway Trend Sparkline */}
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#22C55E/0.05] via-[hsl(180,80%,45%)/0.03] to-[hsl(226,100%,59%)/0.05] border border-[#22C55E/0.15]"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E/0.3] to-[hsl(180,80%,45%)/0.3] flex items-center justify-center">
                            <Activity className="w-5 h-5 text-[hsl(152,100%,60%)]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Runway Trend</p>
                            <p className="text-xs text-[hsl(220,10%,50%)]">Last 5 analyses</p>
                          </div>
                        </div>
                        
                        {(() => {
                          // Get last 5 analyses for sparkline (reversed for chronological order)
                          const currentIndex = analyses.findIndex(a => a.id === selectedAnalysis.id);
                          const sparklineData = analyses
                            .slice(currentIndex, Math.min(currentIndex + 5, analyses.length))
                            .reverse()
                            .map((a, idx) => ({
                              index: idx,
                              runway: a.runway,
                              label: a.date.split(",")[0], // Just "Dec 28" part
                              isCurrent: a.id === selectedAnalysis.id
                            }));
                          
                          const minRunway = Math.min(...sparklineData.map(d => d.runway));
                          const maxRunway = Math.max(...sparklineData.map(d => d.runway));
                          const avgRunway = sparklineData.reduce((sum, d) => sum + d.runway, 0) / sparklineData.length;
                          
                          return (
                            <div className="relative">
                              {/* Glow effect behind chart */}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#22C55E/0.1] to-transparent blur-xl" />
                              
                              <div className="relative h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={sparklineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="runwaySparkGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0.5} />
                                        <stop offset="50%" stopColor="hsl(180, 80%, 45%)" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="hsl(180, 80%, 45%)" stopOpacity={0} />
                                      </linearGradient>
                                      <linearGradient id="runwayStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="hsl(180, 80%, 45%)" />
                                        <stop offset="50%" stopColor="hsl(152, 100%, 50%)" />
                                        <stop offset="100%" stopColor="hsl(140, 90%, 55%)" />
                                      </linearGradient>
                                      <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge>
                                          <feMergeNode in="coloredBlur"/>
                                          <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                      </filter>
                                    </defs>
                                    <XAxis 
                                      dataKey="label" 
                                      axisLine={false} 
                                      tickLine={false}
                                      tick={{ fill: "hsl(220,10%,50%)", fontSize: 10 }}
                                    />
                                    <YAxis 
                                      hide 
                                      domain={[minRunway - 2, maxRunway + 2]} 
                                    />
                                    <ReferenceLine 
                                      y={avgRunway} 
                                      stroke="hsl(220, 10%, 30%)" 
                                      strokeDasharray="4 4"
                                      strokeWidth={1}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        background: "hsl(240,7%,12%)",
                                        border: "1px solid hsl(152,100%,50%,0.3)",
                                        borderRadius: "12px",
                                        color: "white",
                                        boxShadow: "0 10px 40px hsl(152,100%,50%,0.2)"
                                      }}
                                      formatter={(value: number) => [`${value.toFixed(1)} months`, "Runway"]}
                                      labelFormatter={(label) => label}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="runway"
                                      stroke="url(#runwayStrokeGradient)"
                                      strokeWidth={3}
                                      fill="url(#runwaySparkGradient)"
                                      filter="url(#glow)"
                                      animationDuration={1500}
                                      animationBegin={700}
                                      dot={({ cx, cy, payload }) => (
                                        <motion.circle
                                          key={payload.index}
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.8 + payload.index * 0.1 }}
                                          cx={cx}
                                          cy={cy}
                                          r={payload.isCurrent ? 6 : 4}
                                          fill={payload.isCurrent ? "hsl(152, 100%, 50%)" : "hsl(180, 80%, 45%)"}
                                          stroke={payload.isCurrent ? "white" : "transparent"}
                                          strokeWidth={2}
                                          style={{ filter: payload.isCurrent ? "drop-shadow(0 0 8px hsl(152, 100%, 50%))" : "none" }}
                                        />
                                      )}
                                      activeDot={{
                                        r: 8,
                                        fill: "hsl(152, 100%, 50%)",
                                        stroke: "white",
                                        strokeWidth: 2,
                                        style: { filter: "drop-shadow(0 0 10px hsl(152, 100%, 50%))" }
                                      }}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                              
                              {/* Stats Row */}
                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <div className="text-center">
                                  <p className="text-xs text-[rgba(255,255,255,0.4)]">Min</p>
                                  <p className="text-sm font-bold text-[hsl(0,70%,60%)]">{minRunway.toFixed(1)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-[rgba(255,255,255,0.4)]">Average</p>
                                  <p className="text-sm font-bold text-[hsl(180,80%,55%)]">{avgRunway.toFixed(1)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-[rgba(255,255,255,0.4)]">Max</p>
                                  <p className="text-sm font-bold text-[hsl(152,100%,55%)]">{maxRunway.toFixed(1)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-[rgba(255,255,255,0.4)]">Trend</p>
                                  <div className={`flex items-center gap-1 ${sparklineData[sparklineData.length - 1]?.runway > sparklineData[0]?.runway ? "text-[hsl(152,100%,55%)]" : "text-[hsl(0,70%,60%)]"}`}>
                                    {sparklineData[sparklineData.length - 1]?.runway > sparklineData[0]?.runway ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                    <span className="text-sm font-bold">
                                      {((sparklineData[sparklineData.length - 1]?.runway - sparklineData[0]?.runway)).toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Insight Section */}
            {selectedAnalysis.insight && (
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="px-8 pb-8"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,50%)/0.1] to-[hsl(226,100%,59%)/0.1] border border-[hsl(270,60%,55%)/0.2]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(270,60%,55%)/0.2] flex items-center justify-center">
                      <Archive className="w-5 h-5 text-[hsl(270,60%,65%)]" />
                    </div>
                    <span className="text-sm font-semibold text-[hsl(270,60%,70%)]">AI Insight</span>
                  </div>
                  <p className="text-[hsl(220,10%,75%)] leading-relaxed text-lg">{selectedAnalysis.insight}</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-8 pb-8 flex flex-col sm:flex-row justify-center gap-4"
            >
              {/* Conditional button based on entry type */}
              {selectedAnalysis.entryType === "SIMULATION" ? (
                <Button 
                  onClick={() => {
                    setDetailOpen(false);
                    rehydrateSimulation(selectedAnalysis);
                  }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(226,100%,59%)] hover:from-[hsl(270,60%,60%)] hover:to-[hsl(226,100%,65%)] text-white font-semibold shadow-lg shadow-[hsl(270,60%,55%)/0.3] transition-all"
                >
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Load in Simulator
                </Button>
              ) : (
                <Button 
                  onClick={() => rehydrateDNALab(selectedAnalysis)}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#22C55E] to-[hsl(180,80%,45%)] hover:from-[hsl(152,100%,55%)] hover:to-[hsl(180,80%,50%)] text-black font-semibold shadow-lg shadow-[#22C55E/0.3] transition-all"
                >
                  <FlaskConical className="w-4 h-4 mr-2" />
                  View in DNA Lab
                </Button>
              )}
              <Button 
                onClick={() => setDetailOpen(false)}
                variant="outline"
                className="px-8 py-3 rounded-xl border-white/20 hover:border-white/40 text-white font-semibold transition-all"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          STATS DETAIL MODALS - Total Analyses, Average Runway, Last Analysis
      ═══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {statsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setStatsModalOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.9, y: 50, opacity: 0, rotateX: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-white/10 shadow-2xl"
              style={{
                boxShadow: statsModalOpen === "total" 
                  ? "0 0 100px hsl(226,100%,59%,0.3), 0 0 200px hsl(226,100%,59%,0.1)" 
                  : statsModalOpen === "average" 
                    ? "0 0 100px hsl(152,100%,50%,0.3), 0 0 200px hsl(152,100%,50%,0.1)"
                    : "0 0 100px hsl(270,60%,55%,0.3), 0 0 200px hsl(270,60%,55%,0.1)"
              }}
            >
              {/* TOTAL ANALYSES MODAL */}
              {statsModalOpen === "total" && (
                <>
                  <div className="relative p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[hsl(226,100%,59%)/0.15] via-transparent to-[hsl(180,80%,45%)/0.1]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[hsl(226,100%,59%)/0.2] blur-[100px] rounded-full" />
                    
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(180,80%,45%)] flex items-center justify-center shadow-lg shadow-[hsl(226,100%,59%)/0.4]">
                        <Archive className="w-8 h-8 text-white" />
    </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">Analysis History</h2>
                        <p className="text-[rgba(255,255,255,0.5)]">Your complete DNA analysis journey</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-8 pb-8">
                    {/* Main Stat */}
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-8"
                    >
                      <motion.span 
                        className="text-8xl font-bold bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(180,80%,45%)] bg-clip-text text-transparent"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                      >
                        {stats.total}
                      </motion.span>
                      <p className="text-xl text-[rgba(255,255,255,0.5)] mt-2">Total Analyses Performed</p>
                    </motion.div>

                    {/* Grade Distribution */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-2xl bg-[rgba(20,20,20,0.6)] border border-white/5 mb-6"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                        Grade Distribution
                      </h3>
                      <div className="space-y-3">
                        {["A", "B", "C", "D", "F"].map((grade, i) => {
                          const count = analyses.filter(a => a.grade.toUpperCase() === grade).length;
                          const percentage = analyses.length > 0 ? (count / analyses.length) * 100 : 0;
                          const colors = {
                            A: "#22C55E",
                            B: "hsl(226,100%,59%)",
                            C: "hsl(45,90%,55%)",
                            D: "hsl(30,80%,50%)",
                            F: "#DC2626"
                          };
                          return (
                            <motion.div 
                              key={grade}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.3 + i * 0.05 }}
                              className="flex items-center gap-4"
                            >
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                                style={{ 
                                  background: colors[grade as keyof typeof colors] + "20",
                                  color: colors[grade as keyof typeof colors]
                                }}
                              >
                                {grade}
                              </div>
                              <div className="flex-1">
                                <div className="h-3 rounded-full bg-[hsl(240,7%,15%)] overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.4 + i * 0.05, duration: 0.8 }}
                                    className="h-full rounded-full"
                                    style={{ background: colors[grade as keyof typeof colors] }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-mono text-[rgba(255,255,255,0.5)] w-16 text-right">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 rounded-2xl bg-[rgba(20,20,20,0.6)] border border-white/5"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[hsl(270,60%,55%)]" />
                        Analysis Timeline
                      </h3>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={(() => {
                            const monthlyData: Record<string, number> = {};
                            analyses.forEach(a => {
                              const date = new Date(a.date);
                              const key = date.toLocaleDateString("en-US", { month: "short" });
                              monthlyData[key] = (monthlyData[key] || 0) + 1;
                            });
                            return Object.entries(monthlyData).slice(-6).map(([month, count]) => ({ month, count }));
                          })()}>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                            <Bar dataKey="count" fill="hsl(226,100%,59%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-8 pb-8">
                    <Button 
                      onClick={() => setStatsModalOpen(null)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(180,80%,45%)] hover:opacity-90 text-white font-semibold"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}

              {/* AVERAGE RUNWAY MODAL */}
              {statsModalOpen === "average" && (
                <>
                  <div className="relative p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E/0.15] via-transparent to-[hsl(180,80%,45%)/0.1]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#22C55E/0.2] blur-[100px] rounded-full" />
                    
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[hsl(180,80%,45%)] flex items-center justify-center shadow-lg shadow-[#22C55E/0.4]">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">Runway Analytics</h2>
                        <p className="text-[rgba(255,255,255,0.5)]">Your runway performance over time</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-8 pb-8">
                    {/* Main Stat with Gauge */}
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-8 relative"
                    >
                      <div className="relative inline-block">
                        <svg className="w-48 h-48" viewBox="0 0 100 50">
                          <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="hsl(240,7%,20%)"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          <motion.path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: Math.min(parseFloat(stats.avgRunway) / 24, 1) }}
                            transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
                          />
                          <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="hsl(152, 100%, 50%)" />
                              <stop offset="100%" stopColor="hsl(180, 80%, 45%)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                          <motion.span 
                            className="text-5xl font-bold text-[#22C55E]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {stats.avgRunway}
                          </motion.span>
                        </div>
                      </div>
                      <p className="text-xl text-[rgba(255,255,255,0.5)] mt-2">Average Runway (months)</p>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-3 gap-4 mb-6"
                    >
                      {[
                        { label: "Minimum", value: analyses.length > 0 ? Math.min(...analyses.map(a => a.runway)).toFixed(1) : "0", color: "#DC2626", icon: TrendingDownIcon },
                        { label: "Current", value: analyses[0]?.runway.toFixed(1) || "0", color: "hsl(226,100%,59%)", icon: Target },
                        { label: "Maximum", value: analyses.length > 0 ? Math.max(...analyses.map(a => a.runway)).toFixed(1) : "0", color: "#22C55E", icon: Crown }
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="p-4 rounded-xl text-center"
                          style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}30` }}
                        >
                          <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="text-xs text-[hsl(220,10%,50%)]">{stat.label}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Runway Trend Chart */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="p-6 rounded-2xl bg-[rgba(20,20,20,0.6)] border border-white/5"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#22C55E]" />
                        Runway Evolution
                      </h3>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[...analyses].reverse().map((a, i) => ({ index: i, runway: a.runway, date: a.date }))}>
                            <defs>
                              <linearGradient id="runwayFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="index" hide />
                            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                            <Tooltip
                              contentStyle={{ background: "hsl(240,7%,12%)", border: "1px solid hsl(152,100%,50%,0.3)", borderRadius: "12px" }}
                              formatter={(value: number) => [`${value.toFixed(1)} months`, "Runway"]}
                            />
                            <Area type="monotone" dataKey="runway" stroke="#22C55E" strokeWidth={3} fill="url(#runwayFill)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-8 pb-8">
                    <Button 
                      onClick={() => setStatsModalOpen(null)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22C55E] to-[hsl(180,80%,45%)] hover:opacity-90 text-black font-semibold"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}

              {/* LAST ANALYSIS MODAL */}
              {statsModalOpen === "last" && analyses.length > 0 && (
                <>
                  <div className="relative p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[hsl(270,60%,55%)/0.15] via-transparent to-[hsl(226,100%,59%)/0.1]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[hsl(270,60%,55%)/0.2] blur-[100px] rounded-full" />
                    
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(226,100%,59%)] flex items-center justify-center shadow-lg shadow-[hsl(270,60%,55%)/0.4]">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">Latest Analysis</h2>
                        <p className="text-[rgba(255,255,255,0.5)]">{stats.lastAnalysis}</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-8 pb-8">
                    {/* Latest Analysis Summary */}
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 rounded-2xl mb-6 relative overflow-hidden"
                      style={{
                        background: analyses[0].grade === "A" 
                          ? "linear-gradient(135deg, hsl(152,100%,50%,0.1), hsl(180,80%,45%,0.05))"
                          : analyses[0].grade === "B"
                            ? "linear-gradient(135deg, hsl(226,100%,59%,0.1), hsl(200,70%,50%,0.05))"
                            : "linear-gradient(135deg, hsl(45,90%,55%,0.1), hsl(30,80%,50%,0.05))"
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[rgba(255,255,255,0.5)] text-sm mb-1">Financial Health Grade</p>
                          <div className="flex items-center gap-4">
                            <motion.div
                              initial={{ rotate: -180, scale: 0 }}
                              animate={{ rotate: 0, scale: 1 }}
                              transition={{ delay: 0.2, type: "spring" }}
                              className={`w-20 h-20 rounded-2xl ${getGradeClass(analyses[0].grade)} flex items-center justify-center text-4xl font-bold shadow-lg`}
                            >
                              {analyses[0].grade}
                            </motion.div>
                            <div>
                              <p className="text-3xl font-bold text-white">{analyses[0].runway.toFixed(1)} mo</p>
                              <p className={`text-sm ${analyses[0].trend === "up" ? "text-[#22C55E]" : "text-[#DC2626]"}`}>
                                {analyses[0].change} from previous
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[rgba(255,255,255,0.5)] text-sm">Analyzed</p>
                          <p className="text-xl font-semibold text-white">{analyses[0].date}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-3 gap-4 mb-6"
                    >
                      <div className="p-4 rounded-xl bg-[#22C55E/0.1] border border-[#22C55E/0.2] text-center">
                        <Wallet className="w-5 h-5 mx-auto mb-2 text-[#22C55E]" />
                        <p className="text-xl font-bold text-white">
                          {analyses[0].cashOnHand ? `$${(analyses[0].cashOnHand / 1000).toFixed(0)}k` : "—"}
                        </p>
                        <p className="text-xs text-[hsl(220,10%,50%)]">Cash on Hand</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#DC2626/0.1] border border-[#DC2626/0.2] text-center">
                        <Flame className="w-5 h-5 mx-auto mb-2 text-[#DC2626]" />
                        <p className="text-xl font-bold text-white">
                          {analyses[0].monthlyBurn ? `$${(analyses[0].monthlyBurn / 1000).toFixed(0)}k` : "—"}
                        </p>
                        <p className="text-xs text-[hsl(220,10%,50%)]">Monthly Burn</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[hsl(226,100%,59%)/0.1] border border-[hsl(226,100%,59%)/0.2] text-center">
                        <Percent className="w-5 h-5 mx-auto mb-2 text-[hsl(226,100%,59%)]" />
                        <p className="text-xl font-bold text-white">
                          {analyses[0].profitMargin !== undefined ? `${analyses[0].profitMargin}%` : "—"}
                        </p>
                        <p className="text-xs text-[hsl(220,10%,50%)]">Profit Margin</p>
                      </div>
                    </motion.div>

                    {/* Insight */}
                    {analyses[0].insight && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-xl bg-[hsl(270,60%,55%)/0.1] border border-[hsl(270,60%,55%)/0.2]"
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-[hsl(270,60%,65%)] mt-0.5" />
                          <p className="text-[hsl(220,10%,70%)] leading-relaxed">{analyses[0].insight}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="px-8 pb-8 flex gap-4">
                    <Button 
                      onClick={() => {
                        setStatsModalOpen(null);
                        handleViewAnalysis(analyses[0]);
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(226,100%,59%)] hover:opacity-90 text-white font-semibold"
                    >
                      View Full Details
                    </Button>
                    <Button 
                      onClick={() => setStatsModalOpen(null)}
                      variant="outline"
                      className="px-6 py-3 rounded-xl border-white/20 hover:border-white/40 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════════
          METRIC DETAIL MODALS - Cash, Burn, Margin (inside detail view)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {metricModalOpen && selectedAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setMetricModalOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-white/10 shadow-2xl overflow-hidden"
              style={{
                boxShadow: metricModalOpen === "cash" 
                  ? "0 0 80px hsl(152,100%,50%,0.3)" 
                  : metricModalOpen === "burn" 
                    ? "0 0 80px hsl(0,70%,55%,0.3)"
                    : "0 0 80px hsl(226,100%,59%,0.3)"
              }}
            >
              {/* CASH ON HAND MODAL */}
              {metricModalOpen === "cash" && (
                <>
                  <div className="relative p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E/0.2] via-transparent to-transparent" />
                    <div className="absolute top-0 left-0 w-[300px] h-[150px] bg-[#22C55E/0.3] blur-[80px] rounded-full" />
                    
                    <motion.div className="relative flex items-center gap-4">
                      <motion.div 
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[hsl(180,80%,45%)] flex items-center justify-center shadow-lg"
                      >
                        <Wallet className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Cash on Hand</h2>
                        <p className="text-[rgba(255,255,255,0.5)]">Available runway capital</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-6 pb-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-6 py-8 rounded-2xl bg-[#22C55E/0.1] border border-[#22C55E/0.2]"
                    >
                      <motion.span 
                        className="text-5xl font-bold text-[#22C55E]"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                      >
                        ${selectedAnalysis.cashOnHand?.toLocaleString() || "0"}
                      </motion.span>
                      <p className="text-[rgba(255,255,255,0.5)] mt-2">Current Balance</p>
                    </motion.div>

                    {/* Cash Insights */}
                    <div className="space-y-3">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-[#22C55E]" />
                          <span className="text-[hsl(220,10%,70%)]">Runway Coverage</span>
                        </div>
                        <span className="font-bold text-white">{selectedAnalysis.runway.toFixed(1)} months</span>
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <PiggyBank className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                          <span className="text-[hsl(220,10%,70%)]">Daily Burn</span>
                        </div>
                        <span className="font-bold text-white">
                          ${selectedAnalysis.monthlyBurn ? (selectedAnalysis.monthlyBurn / 30).toFixed(0) : "0"}/day
                        </span>
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                          <span className="text-[hsl(220,10%,70%)]">Zero Cash Date</span>
                        </div>
                        <span className="font-bold text-white">
                          {(() => {
                            const monthsLeft = selectedAnalysis.runway;
                            const zeroDate = new Date();
                            zeroDate.setMonth(zeroDate.getMonth() + Math.floor(monthsLeft));
                            return zeroDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                          })()}
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <Button 
                      onClick={() => setMetricModalOpen(null)}
                      className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[hsl(152,100%,55%)] text-black font-semibold"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}

              {/* MONTHLY BURN MODAL */}
              {metricModalOpen === "burn" && (
                <>
                  <div className="relative p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#DC2626/0.2] via-transparent to-transparent" />
                    <div className="absolute top-0 left-0 w-[300px] h-[150px] bg-[#DC2626/0.3] blur-[80px] rounded-full" />
                    
                    <motion.div className="relative flex items-center gap-4">
                      <motion.div 
                        initial={{ rotate: 180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[hsl(15,80%,50%)] flex items-center justify-center shadow-lg"
                      >
                        <Flame className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Monthly Burn</h2>
                        <p className="text-[rgba(255,255,255,0.5)]">Cash outflow rate</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-6 pb-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-6 py-8 rounded-2xl bg-[#DC2626/0.1] border border-[#DC2626/0.2]"
                    >
                      <motion.span 
                        className="text-5xl font-bold text-[#DC2626]"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                      >
                        ${selectedAnalysis.monthlyBurn?.toLocaleString() || "0"}
                      </motion.span>
                      <p className="text-[rgba(255,255,255,0.5)] mt-2">Per Month</p>
                    </motion.div>

                    {/* Burn Breakdown */}
                    <div className="space-y-3">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-[#DC2626]" />
                          <span className="text-[hsl(220,10%,70%)]">Weekly Burn</span>
                        </div>
                        <span className="font-bold text-white">
                          ${selectedAnalysis.monthlyBurn ? (selectedAnalysis.monthlyBurn / 4).toLocaleString() : "0"}
                        </span>
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                          <span className="text-[hsl(220,10%,70%)]">Annual Burn Rate</span>
                        </div>
                        <span className="font-bold text-white">
                          ${selectedAnalysis.monthlyBurn ? ((selectedAnalysis.monthlyBurn * 12) / 1000).toFixed(0) : "0"}k/yr
                        </span>
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-[#22C55E]" />
                          <span className="text-[hsl(220,10%,70%)]">Burn Efficiency</span>
                        </div>
                        <span className="font-bold text-white">
                          {selectedAnalysis.cashOnHand && selectedAnalysis.monthlyBurn 
                            ? (selectedAnalysis.cashOnHand / selectedAnalysis.monthlyBurn).toFixed(1) 
                            : "∞"} months
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <Button 
                      onClick={() => setMetricModalOpen(null)}
                      className="w-full py-3 rounded-xl bg-[#DC2626] hover:bg-[hsl(0,70%,60%)] text-white font-semibold"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}

              {/* PROFIT MARGIN MODAL */}
              {metricModalOpen === "margin" && (
                <>
                  <div className="relative p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[hsl(226,100%,59%)/0.2] via-transparent to-transparent" />
                    <div className="absolute top-0 left-0 w-[300px] h-[150px] bg-[hsl(226,100%,59%)/0.3] blur-[80px] rounded-full" />
                    
                    <motion.div className="relative flex items-center gap-4">
                      <motion.div 
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(200,70%,50%)] flex items-center justify-center shadow-lg"
                      >
                        <Percent className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Profit Margin</h2>
                        <p className="text-[rgba(255,255,255,0.5)]">Profitability ratio</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-6 pb-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-6 py-8 rounded-2xl bg-[hsl(226,100%,59%)/0.1] border border-[hsl(226,100%,59%)/0.2] relative overflow-hidden"
                    >
                      {/* Pie Chart Background */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(240,7%,25%)" strokeWidth="20" />
                          <motion.circle 
                            cx="100" cy="100" r="80" 
                            fill="none" 
                            stroke="hsl(226,100%,59%)" 
                            strokeWidth="20"
                            strokeDasharray={`${(selectedAnalysis.profitMargin || 0) * 5.02} 502`}
                            strokeLinecap="round"
                            transform="rotate(-90 100 100)"
                            initial={{ strokeDasharray: "0 502" }}
                            animate={{ strokeDasharray: `${(selectedAnalysis.profitMargin || 0) * 5.02} 502` }}
                            transition={{ delay: 0.2, duration: 1.5 }}
                          />
                        </svg>
                      </div>
                      <motion.span 
                        className="relative text-5xl font-bold text-[hsl(226,100%,59%)]"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                      >
                        {selectedAnalysis.profitMargin !== undefined ? `${selectedAnalysis.profitMargin}%` : "—"}
                      </motion.span>
                      <p className="relative text-[rgba(255,255,255,0.5)] mt-2">Current Margin</p>
                    </motion.div>

                    {/* Margin Insights */}
                    <div className="space-y-3">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Medal className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                          <span className="text-[hsl(220,10%,70%)]">Industry Benchmark</span>
                        </div>
                        <span className="font-bold text-white">15-25%</span>
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-[#22C55E]" />
                          <span className="text-[hsl(220,10%,70%)]">Status</span>
                        </div>
                        <span className={`font-bold ${
                          (selectedAnalysis.profitMargin || 0) >= 20 ? "text-[#22C55E]" :
                          (selectedAnalysis.profitMargin || 0) >= 10 ? "text-[hsl(45,90%,55%)]" :
                          "text-[#DC2626]"
                        }`}>
                          {(selectedAnalysis.profitMargin || 0) >= 20 ? "Excellent" :
                           (selectedAnalysis.profitMargin || 0) >= 10 ? "Healthy" :
                           (selectedAnalysis.profitMargin || 0) > 0 ? "Needs Work" : "Negative"}
                        </span>
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                          <span className="text-[hsl(220,10%,70%)]">Trend</span>
                        </div>
                        <span className={`font-bold flex items-center gap-1 ${
                          selectedAnalysis.trend === "up" ? "text-[#22C55E]" : "text-[#DC2626]"
                        }`}>
                          {selectedAnalysis.trend === "up" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {selectedAnalysis.change}
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <Button 
                      onClick={() => setMetricModalOpen(null)}
                      className="w-full py-3 rounded-xl bg-[hsl(226,100%,59%)] hover:bg-[hsl(226,100%,65%)] text-white font-semibold"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

DNAArchive.displayName = "DNAArchive";

export default DNAArchive;
