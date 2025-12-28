import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { 
  Wrench, 
  BookOpen, 
  Video, 
  FileText, 
  Calculator, 
  PieChart, 
  TrendingUp,
  ExternalLink,
  Sparkles,
  Users,
  DollarSign,
  Crown,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/config";
import { BurnRateCalculator } from "@/components/toolkit/BurnRateCalculator";
import { RunwaySimulator } from "@/components/toolkit/RunwaySimulator";
import { GrowthTracker } from "@/components/toolkit/GrowthTracker";
import { HiringPlanner } from "@/components/toolkit/HiringPlanner";
import { HiringProvider, useHiring } from "@/contexts/HiringContext";

interface AnalysisData {
  monthly_burn?: number;
  cash_on_hand?: number;
  runway_months?: number;
}

const resources = [
  {
    icon: BookOpen,
    title: "Founder's Guide to Runway",
    type: "Guide",
    readTime: "12 min read",
    url: "https://www.ycombinator.com/library/5k-how-to-keep-your-company-alive",
  },
  {
    icon: Video,
    title: "Decoding Your Financial DNA",
    type: "Video",
    readTime: "8 min watch",
    url: "https://www.youtube.com/watch?v=XwM0jxN3xYo",
  },
  {
    icon: FileText,
    title: "Investor Update Template",
    type: "Template",
    readTime: "Download",
    url: "https://docs.google.com/document/d/1xb6y8qpZRG-HG0AwgC0jWNHKQnp_hKV8qj3oVZ6pQqo/edit",
  },
  {
    icon: DollarSign,
    title: "Fundraising Metrics Cheatsheet",
    type: "Cheatsheet",
    readTime: "5 min read",
    url: "https://visible.vc/blog/startup-fundraising-metrics/",
  },
];

// Simulation snapshot data for rehydration
interface SimulationSnapshot {
  simParams?: {
    cashOnHand: number;
    monthlyExpenses: number;
    monthlyRevenue: number;
    expenseGrowth: number;
    revenueGrowth: number;
  };
  scenarioB?: {
    cashOnHand: number;
    monthlyExpenses: number;
    monthlyRevenue: number;
    expenseGrowth: number;
    revenueGrowth: number;
  };
  hiringPlan?: {
    id: string;
    title: string;
    salary: number;
    count: number;
    start_month: number;
  }[];
  scenarioMode?: boolean;
  date?: string;
}

// Inner component that uses the HiringContext
const FounderToolkitContent = forwardRef<HTMLDivElement>((_, ref) => {
  const [searchParams] = useSearchParams();
  const [burnCalcOpen, setBurnCalcOpen] = useState(false);
  const [runwaySimOpen, setRunwaySimOpen] = useState(false);
  const [growthTrackerOpen, setGrowthTrackerOpen] = useState(false);
  const [hiringPlannerOpen, setHiringPlannerOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [simulationSnapshot, setSimulationSnapshot] = useState<SimulationSnapshot | null>(null);
  
  // Get hiring data from shared context
  const { totalNewHires, hiringImpact, updateRole } = useHiring();
  
  // ═══════════════════════════════════════════════════════════════════════════
  // REHYDRATION HOOK - Check for simulation snapshot and auto-open simulator
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const isSimulationRedirect = searchParams.get("simulation") === "true";
    
    if (isSimulationRedirect) {
      const storedData = sessionStorage.getItem("runwayDNA_simulation");
      if (storedData) {
        try {
          const snapshot: SimulationSnapshot = JSON.parse(storedData);
          setSimulationSnapshot(snapshot);
          
          // Rehydrate hiring plan into context
          if (snapshot.hiringPlan && snapshot.hiringPlan.length > 0) {
            snapshot.hiringPlan.forEach(hire => {
              if (hire.count > 0) {
                // Update role count and start month in context
                updateRole(hire.id, { 
                  count: hire.count, 
                  startMonth: hire.start_month,
                  salary: hire.salary,
                });
              }
            });
          }
          
          // Auto-open the simulator
          setRunwaySimOpen(true);
          
          // Clear the session storage after loading
          sessionStorage.removeItem("runwayDNA_simulation");
        } catch (e) {
          console.error("Failed to parse simulation snapshot:", e);
        }
      }
    }
  }, [searchParams, updateRole]);

  // Try to fetch latest analysis data from backend
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(apiUrl("/api/archive"));
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setAnalysisData(data[0]);
          }
        }
      } catch {
        // Use defaults if API unavailable
      }
    };
    fetchAnalysisData();
  }, []);

  const handleResourceClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleViewAll = () => {
    window.open("https://www.ycombinator.com/library?categories=finance", "_blank");
  };

  const tools = [
    {
      icon: Calculator,
      title: "Burn Rate Calculator",
      description: "Model different spending scenarios",
      color: "hsl(226,100%,59%)",
      bgColor: "hsl(226,100%,59%)/0.15",
      onClick: () => setBurnCalcOpen(true),
      linked: false,
    },
    {
      icon: PieChart,
      title: "Runway Simulator",
      description: totalNewHires > 0 
        ? `Connected: +${totalNewHires} hire${totalNewHires > 1 ? 's' : ''} planned`
        : "Visualize cash runway projections",
      color: "hsl(152,100%,50%)",
      bgColor: "hsl(152,100%,50%)/0.15",
      onClick: () => setRunwaySimOpen(true),
      linked: totalNewHires > 0,
      badge: totalNewHires > 0 ? `+${totalNewHires}` : null,
    },
    {
      icon: TrendingUp,
      title: "Growth Tracker",
      description: "Monitor MRR & ARR metrics",
      color: "hsl(270,60%,55%)",
      bgColor: "hsl(270,60%,55%)/0.15",
      onClick: () => setGrowthTrackerOpen(true),
      linked: false,
    },
    {
      icon: Users,
      title: "Hiring Planner",
      description: totalNewHires > 0 
        ? `${totalNewHires} hire${totalNewHires > 1 ? 's' : ''} → Simulator`
        : "Plan team growth vs burn",
      color: "hsl(45,90%,55%)",
      bgColor: "hsl(45,90%,55%)/0.15",
      onClick: () => setHiringPlannerOpen(true),
      linked: totalNewHires > 0,
      badge: totalNewHires > 0 ? `${totalNewHires}` : null,
    },
  ];


  return (
    <div ref={ref} className="min-h-screen w-full p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-gradient-cobalt">Founder Toolkit</h1>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(152,100%,50%)/0.15] text-[hsl(152,100%,50%)] text-xs font-medium">
            <Crown className="w-3 h-3" />
            PRO
          </span>
        </div>
        <p className="text-[hsl(220,10%,50%)] text-sm">
          Tools and resources to maximize your runway
        </p>
      </motion.header>

      {/* Tools Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-6">
          <Wrench className="w-5 h-5 text-[hsl(226,100%,59%)]" />
          <h2 className="text-xl font-bold text-white">Financial Tools</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.2 }}
              onClick={tool.onClick}
              className={`glass-panel p-6 hover:border-[hsl(226,100%,59%)/0.3] transition-all cursor-pointer group relative overflow-hidden ${
                tool.linked ? "border-[hsl(152,100%,50%)/0.3]" : ""
              }`}
            >
              {/* Linked indicator glow */}
              {tool.linked && (
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(152,100%,50%)/0.05] to-transparent pointer-events-none" />
              )}
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: tool.bgColor }}
                  >
                    <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
                  </div>
                  
                  {/* Linked badge */}
                  {tool.linked && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(152,100%,50%)/0.15] border border-[hsl(152,100%,50%)/0.3]">
                      <Link2 className="w-3 h-3 text-[hsl(152,100%,50%)]" />
                      <span className="text-[10px] font-semibold text-[hsl(152,100%,50%)]">
                        {tool.badge}
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-white font-semibold mb-2 group-hover:text-[hsl(226,100%,68%)] transition-colors">
                  {tool.title}
                </h3>
                <p className={`text-sm ${tool.linked ? "text-[hsl(152,100%,60%)]" : "text-[hsl(220,10%,50%)]"}`}>
                  {tool.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Resources Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[hsl(152,100%,50%)]" />
            <h2 className="text-xl font-bold text-white">Learning Resources</h2>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleViewAll}
            className="text-[hsl(226,100%,59%)] hover:text-[hsl(226,100%,68%)]"
          >
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.4 }}
              onClick={() => handleResourceClick(resource.url)}
              className="glass-panel p-5 flex items-center gap-4 hover:border-[hsl(226,100%,59%)/0.3] transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-[hsl(226,100%,59%)/0.1] flex items-center justify-center shrink-0">
                <resource.icon className="w-5 h-5 text-[hsl(226,100%,59%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate group-hover:text-[hsl(226,100%,68%)] transition-colors">
                  {resource.title}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[hsl(226,100%,59%)]">{resource.type}</span>
                  <span className="text-[hsl(220,10%,40%)]">•</span>
                  <span className="text-[hsl(220,10%,50%)]">{resource.readTime}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[hsl(220,10%,40%)] group-hover:text-[hsl(226,100%,59%)] transition-colors shrink-0" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pro Active Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel-intense p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(152,100%,50%)/0.1] via-transparent to-[hsl(226,100%,59%)/0.1]" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(152,100%,50%)] to-[hsl(180,80%,45%)] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                AI-Powered Insights Active
              </h3>
              <p className="text-[hsl(220,10%,55%)]">
                Predictive forecasts, investor-ready reports, and personalized recommendations unlocked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[hsl(152,100%,50%)]">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Pro Member</span>
          </div>
        </div>
      </motion.div>

      {/* New Immersive Calculators */}
      <AnimatePresence>
        {burnCalcOpen && (
          <BurnRateCalculator 
            initialData={analysisData || undefined} 
            onClose={() => setBurnCalcOpen(false)} 
          />
        )}
        {runwaySimOpen && (
          <RunwaySimulator 
            initialData={simulationSnapshot?.simParams ? {
              monthly_burn: simulationSnapshot.simParams.monthlyExpenses,
              cash_on_hand: simulationSnapshot.simParams.cashOnHand,
              monthly_revenue: simulationSnapshot.simParams.monthlyRevenue,
            } : analysisData || undefined}
            initialScenarioB={simulationSnapshot?.scenarioB}
            initialScenarioMode={simulationSnapshot?.scenarioMode}
            onClose={() => {
              setRunwaySimOpen(false);
              setSimulationSnapshot(null);
            }} 
          />
        )}
        {growthTrackerOpen && (
          <GrowthTracker 
            onClose={() => setGrowthTrackerOpen(false)} 
          />
        )}
        {hiringPlannerOpen && (
          <HiringPlanner 
            initialData={analysisData || undefined}
            onClose={() => setHiringPlannerOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
});

FounderToolkitContent.displayName = "FounderToolkitContent";

// Wrapper component that provides the HiringContext
const FounderToolkit = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <HiringProvider>
      <FounderToolkitContent ref={ref} {...props} />
    </HiringProvider>
  );
});

FounderToolkit.displayName = "FounderToolkit";

export default FounderToolkit;
