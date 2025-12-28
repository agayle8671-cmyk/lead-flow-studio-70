import { forwardRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiUrl } from "@/lib/config";

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

const FounderToolkit = forwardRef<HTMLDivElement>((_, ref) => {
  const [burnCalcOpen, setBurnCalcOpen] = useState(false);
  const [runwaySimOpen, setRunwaySimOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  
  // Burn Rate Calculator state
  const [burnInputs, setBurnInputs] = useState({
    revenue: 0,
    payroll: 0,
    marketing: 0,
    operations: 0,
    other: 0,
  });
  
  // Runway Simulator state
  const [runwayInputs, setRunwayInputs] = useState({
    cashOnHand: 500000,
    monthlyBurn: 35000,
    burnChange: 0,
  });

  // Try to fetch latest analysis data from backend
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(apiUrl("/api/archive"));
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setAnalysisData(data[0]);
            setRunwayInputs(prev => ({
              ...prev,
              cashOnHand: data[0].cash_on_hand || prev.cashOnHand,
              monthlyBurn: data[0].monthly_burn || prev.monthlyBurn,
            }));
          }
        }
      } catch {
        // Use defaults if API unavailable
      }
    };
    fetchAnalysisData();
  }, []);

  const calculateBurnRate = () => {
    const totalExpenses = burnInputs.payroll + burnInputs.marketing + burnInputs.operations + burnInputs.other;
    const netBurn = totalExpenses - burnInputs.revenue;
    return { totalExpenses, netBurn, isPositive: netBurn < 0 };
  };

  const calculateRunway = () => {
    const adjustedBurn = runwayInputs.monthlyBurn * (1 + runwayInputs.burnChange / 100);
    const months = adjustedBurn > 0 ? runwayInputs.cashOnHand / adjustedBurn : 999;
    return { months: Math.min(months, 999), adjustedBurn };
  };

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
    },
    {
      icon: PieChart,
      title: "Runway Simulator",
      description: "Visualize cash runway projections",
      color: "hsl(152,100%,50%)",
      bgColor: "hsl(152,100%,50%)/0.15",
      onClick: () => setRunwaySimOpen(true),
    },
    {
      icon: TrendingUp,
      title: "Growth Tracker",
      description: "Monitor MRR & ARR metrics",
      color: "hsl(270,60%,55%)",
      bgColor: "hsl(270,60%,55%)/0.15",
      onClick: () => toast({ title: "Growth Tracker", description: "Connect your Stripe account to track MRR/ARR metrics." }),
    },
    {
      icon: Users,
      title: "Hiring Planner",
      description: "Plan team growth vs burn",
      color: "hsl(45,90%,55%)",
      bgColor: "hsl(45,90%,55%)/0.15",
      onClick: () => toast({ title: "Hiring Planner", description: "Plan your team expansion and see burn rate impact." }),
    },
  ];

  const burnResult = calculateBurnRate();
  const runwayResult = calculateRunway();

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
              className="glass-panel p-6 hover:border-[hsl(226,100%,59%)/0.3] transition-all cursor-pointer group"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: tool.bgColor }}
              >
                <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
              </div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-[hsl(226,100%,68%)] transition-colors">
                {tool.title}
              </h3>
              <p className="text-[hsl(220,10%,50%)] text-sm">
                {tool.description}
              </p>
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

      {/* Burn Rate Calculator Modal */}
      <Dialog open={burnCalcOpen} onOpenChange={setBurnCalcOpen}>
        <DialogContent className="bg-[hsl(270,15%,10%)] border-[hsl(226,100%,59%)/0.2] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-cobalt flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              Burn Rate Calculator
            </DialogTitle>
            <DialogDescription className="text-[hsl(220,10%,55%)]">
              Model your monthly expenses to understand your burn rate
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(220,10%,70%)]">Monthly Revenue ($)</Label>
                <Input
                  type="number"
                  value={burnInputs.revenue}
                  onChange={(e) => setBurnInputs(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                  className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white"
                />
              </div>
              <div>
                <Label className="text-[hsl(220,10%,70%)]">Payroll ($)</Label>
                <Input
                  type="number"
                  value={burnInputs.payroll}
                  onChange={(e) => setBurnInputs(prev => ({ ...prev, payroll: Number(e.target.value) }))}
                  className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white"
                />
              </div>
              <div>
                <Label className="text-[hsl(220,10%,70%)]">Marketing ($)</Label>
                <Input
                  type="number"
                  value={burnInputs.marketing}
                  onChange={(e) => setBurnInputs(prev => ({ ...prev, marketing: Number(e.target.value) }))}
                  className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white"
                />
              </div>
              <div>
                <Label className="text-[hsl(220,10%,70%)]">Operations ($)</Label>
                <Input
                  type="number"
                  value={burnInputs.operations}
                  onChange={(e) => setBurnInputs(prev => ({ ...prev, operations: Number(e.target.value) }))}
                  className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-[hsl(220,10%,70%)]">Other Expenses ($)</Label>
              <Input
                type="number"
                value={burnInputs.other}
                onChange={(e) => setBurnInputs(prev => ({ ...prev, other: Number(e.target.value) }))}
                className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white"
              />
            </div>

            {/* Results */}
            <div className="mt-6 p-4 rounded-xl bg-[hsl(240,7%,8%)] border border-[hsl(226,100%,59%)/0.1]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[hsl(220,10%,55%)]">Total Expenses</span>
                <span className="text-xl font-bold text-white">
                  ${burnResult.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[hsl(220,10%,55%)]">Net Burn Rate</span>
                <span className={`text-2xl font-bold ${burnResult.isPositive ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}>
                  {burnResult.isPositive ? "+" : "-"}${Math.abs(burnResult.netBurn).toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Runway Simulator Modal */}
      <Dialog open={runwaySimOpen} onOpenChange={setRunwaySimOpen}>
        <DialogContent className="bg-[hsl(270,15%,10%)] border-[hsl(226,100%,59%)/0.2] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-cobalt flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              Runway Simulator
            </DialogTitle>
            <DialogDescription className="text-[hsl(220,10%,55%)]">
              Project your runway based on different scenarios
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[hsl(220,10%,70%)]">Cash on Hand ($)</Label>
              <Input
                type="number"
                value={runwayInputs.cashOnHand}
                onChange={(e) => setRunwayInputs(prev => ({ ...prev, cashOnHand: Number(e.target.value) }))}
                className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white"
              />
            </div>
            <div>
              <Label className="text-[hsl(220,10%,70%)]">Current Monthly Burn ($)</Label>
              <Input
                type="number"
                value={runwayInputs.monthlyBurn}
                onChange={(e) => setRunwayInputs(prev => ({ ...prev, monthlyBurn: Number(e.target.value) }))}
                className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white"
              />
            </div>
            <div>
              <Label className="text-[hsl(220,10%,70%)]">Burn Change Scenario (%)</Label>
              <Input
                type="number"
                value={runwayInputs.burnChange}
                onChange={(e) => setRunwayInputs(prev => ({ ...prev, burnChange: Number(e.target.value) }))}
                placeholder="e.g., -20 for 20% reduction"
                className="bg-[hsl(240,7%,12%)] border-[hsl(226,100%,59%)/0.2] text-white placeholder:text-[hsl(220,10%,35%)]"
              />
              <p className="text-xs text-[hsl(220,10%,45%)] mt-1">
                Negative = burn reduction, Positive = burn increase
              </p>
            </div>

            {/* Runway Visualization */}
            <div className="mt-6 p-6 rounded-xl bg-[hsl(240,7%,8%)] border border-[hsl(226,100%,59%)/0.1] text-center">
              <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-wider mb-2">Projected Runway</p>
              <div className="text-6xl font-bold text-gradient-cobalt font-mono mb-2">
                {runwayResult.months.toFixed(1)}
              </div>
              <p className="text-[hsl(220,10%,55%)]">months</p>
              
              {runwayInputs.burnChange !== 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-sm text-[hsl(220,10%,50%)]">
                    Adjusted burn: ${runwayResult.adjustedBurn.toLocaleString()}/mo
                    <span className={runwayInputs.burnChange < 0 ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}>
                      {" "}({runwayInputs.burnChange > 0 ? "+" : ""}{runwayInputs.burnChange}%)
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

FounderToolkit.displayName = "FounderToolkit";

export default FounderToolkit;
