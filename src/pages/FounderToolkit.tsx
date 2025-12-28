import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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

// Ultra-smooth spring physics
const spring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 30,
};

const FounderToolkitContent = forwardRef<HTMLDivElement>((_, ref) => {
  const [searchParams] = useSearchParams();
  const [burnCalcOpen, setBurnCalcOpen] = useState(false);
  const [runwaySimOpen, setRunwaySimOpen] = useState(false);
  const [growthTrackerOpen, setGrowthTrackerOpen] = useState(false);
  const [hiringPlannerOpen, setHiringPlannerOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [simulationSnapshot, setSimulationSnapshot] = useState<SimulationSnapshot | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  
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

  const tools = [
    {
      id: "burn",
      number: "01",
      title: "Burn Rate",
      subtitle: "Calculator",
      description: "Model spending scenarios and monthly cash flow",
      onClick: () => setBurnCalcOpen(true),
    },
    {
      id: "runway",
      number: "02",
      title: "Runway",
      subtitle: "Simulator",
      description: "Project cash runway with growth variables",
      onClick: () => setRunwaySimOpen(true),
      active: totalNewHires > 0,
    },
    {
      id: "growth",
      number: "03",
      title: "Growth",
      subtitle: "Tracker",
      description: "Monitor MRR, ARR, and expansion metrics",
      onClick: () => setGrowthTrackerOpen(true),
    },
    {
      id: "hiring",
      number: "04",
      title: "Hiring",
      subtitle: "Planner",
      description: "Plan team growth against burn rate",
      onClick: () => setHiringPlannerOpen(true),
      active: totalNewHires > 0,
    },
  ];

  const resources = [
    {
      title: "Founder's Guide to Runway Management",
      source: "Y Combinator",
      url: "https://www.ycombinator.com/library/5k-how-to-keep-your-company-alive",
    },
    {
      title: "Understanding Your Burn Rate",
      source: "First Round Review",
      url: "https://review.firstround.com/",
    },
    {
      title: "Investor Update Best Practices",
      source: "Visible.vc",
      url: "https://visible.vc/blog/startup-fundraising-metrics/",
    },
  ];

  return (
    <div ref={ref} className="min-h-screen w-full">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER - Architectural typography
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="px-12 pt-16 pb-20 border-b border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <p className="text-[11px] tracking-[0.3em] text-white/30 uppercase mb-4">
            Financial Tools
          </p>
          <h1 className="text-[42px] font-light text-white tracking-tight leading-none">
            Toolkit
          </h1>
        </motion.div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          TOOLS GRID - Gallery style
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...spring, delay: index * 0.1 }}
            onClick={tool.onClick}
            onMouseEnter={() => setHoveredTool(tool.id)}
            onMouseLeave={() => setHoveredTool(null)}
            className={`relative border-b border-r border-white/[0.06] cursor-pointer group
              ${index % 2 === 0 ? '' : 'md:border-r-0'}
              ${index >= 2 ? 'md:border-b-0' : ''}
            `}
          >
            <div className="p-12 min-h-[240px] flex flex-col justify-between">
              {/* Number */}
              <div className="flex items-start justify-between">
                <span className="text-[11px] tracking-[0.2em] text-white/20 font-mono">
                  {tool.number}
                </span>
                
                {/* Arrow - appears on hover */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: hoveredTool === tool.id ? 1 : 0,
                    x: hoveredTool === tool.id ? 0 : -10,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUpRight className="w-5 h-5 text-white/40" />
                </motion.div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-[28px] font-light text-white leading-tight mb-1">
                  {tool.title}
                </h2>
                <h3 className="text-[28px] font-light text-white/30 leading-tight mb-4">
                  {tool.subtitle}
                </h3>
                <p className="text-[13px] text-white/40 max-w-[280px] leading-relaxed">
                  {tool.description}
                </p>
                
                {/* Active indicator */}
                {tool.active && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    <span className="text-[10px] tracking-[0.15em] text-white/40 uppercase">
                      {totalNewHires} connected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover background */}
            <motion.div
              className="absolute inset-0 bg-white/[0.02] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredTool === tool.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          RESOURCES - Minimal list
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="px-12 py-16 border-t border-white/[0.06]">
        <p className="text-[11px] tracking-[0.3em] text-white/30 uppercase mb-8">
          Resources
        </p>
        
        <div className="space-y-0">
          {resources.map((resource, index) => (
            <motion.a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.4 + index * 0.05 }}
              className="flex items-center justify-between py-5 border-b border-white/[0.06] group cursor-pointer"
            >
              <div className="flex items-center gap-8">
                <span className="text-[11px] text-white/20 font-mono w-6">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[15px] text-white/70 group-hover:text-white transition-colors duration-300">
                  {resource.title}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] tracking-[0.1em] text-white/30 uppercase">
                  {resource.source}
                </span>
                <motion.div
                  initial={{ x: 0, opacity: 0.3 }}
                  whileHover={{ x: 4, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors duration-300" />
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER STATUS
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="px-12 py-8 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">
            Pro Features Active
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span className="text-[11px] tracking-[0.1em] text-white/40">
              AI Insights Enabled
            </span>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════════ */}
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
