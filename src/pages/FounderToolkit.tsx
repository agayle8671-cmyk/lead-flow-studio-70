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
  Zap,
  Users,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  {
    icon: Calculator,
    title: "Burn Rate Calculator",
    description: "Model different spending scenarios",
    color: "hsl(226,100%,59%)",
    bgColor: "hsl(226,100%,59%)/0.15",
  },
  {
    icon: PieChart,
    title: "Runway Simulator",
    description: "Visualize cash runway projections",
    color: "hsl(152,100%,50%)",
    bgColor: "hsl(152,100%,50%)/0.15",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracker",
    description: "Monitor MRR & ARR metrics",
    color: "hsl(270,60%,55%)",
    bgColor: "hsl(270,60%,55%)/0.15",
  },
  {
    icon: Users,
    title: "Hiring Planner",
    description: "Plan team growth vs burn",
    color: "hsl(45,90%,55%)",
    bgColor: "hsl(45,90%,55%)/0.15",
  },
];

const resources = [
  {
    icon: BookOpen,
    title: "Founder's Guide to Runway",
    type: "Guide",
    readTime: "12 min read",
  },
  {
    icon: Video,
    title: "Decoding Your Financial DNA",
    type: "Video",
    readTime: "8 min watch",
  },
  {
    icon: FileText,
    title: "Investor Update Template",
    type: "Template",
    readTime: "Download",
  },
  {
    icon: DollarSign,
    title: "Fundraising Metrics Cheatsheet",
    type: "Cheatsheet",
    readTime: "5 min read",
  },
];

const FounderToolkit = () => {
  return (
    <div className="min-h-screen w-full p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gradient-cobalt mb-1">Founder Toolkit</h1>
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
          <Button variant="ghost" className="text-[hsl(226,100%,59%)] hover:text-[hsl(226,100%,68%)]">
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

      {/* Pro Upgrade Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel-intense p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(226,100%,59%)/0.1] via-transparent to-[hsl(152,100%,50%)/0.1]" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] flex items-center justify-center glow-cobalt">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Unlock AI-Powered Insights
              </h3>
              <p className="text-[hsl(220,10%,55%)]">
                Get predictive forecasts, investor-ready reports, and personalized recommendations
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] text-white font-semibold px-8 hover:shadow-xl hover:shadow-[hsl(226,100%,59%)/0.3] transition-all"
          >
            <Zap className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default FounderToolkit;
