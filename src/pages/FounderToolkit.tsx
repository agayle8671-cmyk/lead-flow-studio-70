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

const FounderToolkitContent = forwardRef<HTMLDivElement>((_, ref) => {
  const [searchParams] = useSearchParams();
  const [burnCalcOpen, setBurnCalcOpen] = useState(false);
  const [runwaySimOpen, setRunwaySimOpen] = useState(false);
  const [growthTrackerOpen, setGrowthTrackerOpen] = useState(false);
  const [hiringPlannerOpen, setHiringPlannerOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [simulationSnapshot, setSimulationSnapshot] = useState<SimulationSnapshot | null>(null);
  
  const { totalNewHires, updateRole } = useHiring();
  
  useEffect(() => {
    const toolParam = searchParams.get("tool");
    if (toolParam) {
      const storedData = sessionStorage.getItem("runwayDNA_initialData");
      if (storedData) {
        try {
          const initialData: AnalysisData = JSON.parse(storedData);
          setAnalysisData(initialData);
        } catch (e) {
          console.error("Failed to parse initial data:", e);
        }
      }
      
      if (toolParam === "runway") setRunwaySimOpen(true);
      else if (toolParam === "burn") setBurnCalcOpen(true);
      else if (toolParam === "growth") setGrowthTrackerOpen(true);
      
      window.history.replaceState({}, "", "/toolkit");
      sessionStorage.removeItem("runwayDNA_initialData");
    }
  }, [searchParams]);
  
  useEffect(() => {
    const isSimulationRedirect = searchParams.get("simulation") === "true";
    
    if (isSimulationRedirect) {
      const storedData = sessionStorage.getItem("runwayDNA_simulation");
      if (storedData) {
        try {
          const snapshot: SimulationSnapshot = JSON.parse(storedData);
          setSimulationSnapshot(snapshot);
          
          if (snapshot.hiringPlan && snapshot.hiringPlan.length > 0) {
            snapshot.hiringPlan.forEach(hire => {
              if (hire.count > 0) {
                updateRole(hire.id, { 
                  count: hire.count, 
                  startMonth: hire.start_month,
                  salary: hire.salary,
                });
              }
            });
          }
          
          setRunwaySimOpen(true);
          sessionStorage.removeItem("runwayDNA_simulation");
        } catch (e) {
          console.error("Failed to parse simulation snapshot:", e);
        }
      }
    }
  }, [searchParams, updateRole]);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(apiUrl("/api/archive"));
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) setAnalysisData(data[0]);
        }
      } catch { /* Use defaults */ }
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
      onClick: () => setBurnCalcOpen(true),
      linked: false,
    },
    {
      icon: PieChart,
      title: "Runway Simulator",
      description: totalNewHires > 0 
        ? `Connected: +${totalNewHires} hire${totalNewHires > 1 ? 's' : ''} planned`
        : "Visualize cash runway projections",
      onClick: () => setRunwaySimOpen(true),
      linked: totalNewHires > 0,
      badge: totalNewHires > 0 ? `+${totalNewHires}` : null,
    },
    {
      icon: TrendingUp,
      title: "Growth Tracker",
      description: "Monitor MRR & ARR metrics",
      onClick: () => setGrowthTrackerOpen(true),
      linked: false,
    },
    {
      icon: Users,
      title: "Hiring Planner",
      description: totalNewHires > 0 
        ? `${totalNewHires} hire${totalNewHires > 1 ? 's' : ''} → Simulator`
        : "Plan team growth vs burn",
      onClick: () => setHiringPlannerOpen(true),
      linked: totalNewHires > 0,
      badge: totalNewHires > 0 ? `${totalNewHires}` : null,
    },
  ];


  return (
    <div ref={ref} className="min-h-screen w-full p-8 lg:p-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-semibold text-white">Founder Toolkit</h1>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(142,69%,50%,0.15)] text-[hsl(142,69%,50%)] text-xs font-medium">
            <Crown className="w-3 h-3" />
            PRO
          </span>
        </div>
        <p className="text-[hsl(0,0%,53%)]">
          Tools and resources to maximize your runway
        </p>
      </motion.header>

      {/* Tools Grid */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Wrench className="w-5 h-5 text-[hsl(211,100%,45%)]" />
          <h2 className="text-lg font-semibold text-white">Financial Tools</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={tool.onClick}
              className={`card-surface-hover p-6 cursor-pointer ${
                tool.linked ? "border-[hsl(142,69%,50%,0.3)]" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(0,0%,14%)] flex items-center justify-center">
                  <tool.icon className="w-5 h-5 text-[hsl(211,100%,45%)]" />
                </div>
                
                {tool.linked && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[hsl(142,69%,50%,0.15)]">
                    <Link2 className="w-3 h-3 text-[hsl(142,69%,50%)]" />
                    <span className="text-[10px] font-medium text-[hsl(142,69%,50%)]">
                      {tool.badge}
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="text-white font-medium mb-1">
                {tool.title}
              </h3>
              <p className={`text-sm ${tool.linked ? "text-[hsl(142,69%,50%)]" : "text-[hsl(0,0%,53%)]"}`}>
                {tool.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Resources Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[hsl(142,69%,50%)]" />
            <h2 className="text-lg font-semibold text-white">Learning Resources</h2>
          </div>
          <Button variant="ghost" onClick={handleViewAll} className="text-[hsl(211,100%,45%)]">
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * index + 0.2 }}
              onClick={() => handleResourceClick(resource.url)}
              className="card-surface-hover p-5 flex items-center gap-4 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[hsl(0,0%,14%)] flex items-center justify-center shrink-0">
                <resource.icon className="w-5 h-5 text-[hsl(211,100%,45%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {resource.title}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[hsl(211,100%,45%)]">{resource.type}</span>
                  <span className="text-[hsl(0,0%,30%)]">•</span>
                  <span className="text-[hsl(0,0%,53%)]">{resource.readTime}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[hsl(0,0%,40%)] shrink-0" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pro Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card-surface p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(142,69%,50%)] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                AI-Powered Insights Active
              </h3>
              <p className="text-[hsl(0,0%,53%)]">
                Predictive forecasts and personalized recommendations unlocked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[hsl(142,69%,50%)]">
            <Crown className="w-5 h-5" />
            <span className="font-medium">Pro Member</span>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
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
          <GrowthTracker onClose={() => setGrowthTrackerOpen(false)} />
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

const FounderToolkit = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <HiringProvider>
      <FounderToolkitContent ref={ref} {...props} />
    </HiringProvider>
  );
});

FounderToolkit.displayName = "FounderToolkit";

export default FounderToolkit;
