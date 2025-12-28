import { motion } from "framer-motion";
import { Archive, Calendar, TrendingUp, FileText, Search, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock historical data
const mockAnalyses = [
  {
    id: 1,
    date: "Dec 28, 2025",
    runway: 18.4,
    grade: "A",
    change: "+2.1",
    trend: "up",
  },
  {
    id: 2,
    date: "Nov 30, 2025",
    runway: 16.3,
    grade: "A",
    change: "+1.8",
    trend: "up",
  },
  {
    id: 3,
    date: "Oct 31, 2025",
    runway: 14.5,
    grade: "B",
    change: "-0.5",
    trend: "down",
  },
  {
    id: 4,
    date: "Sep 30, 2025",
    runway: 15.0,
    grade: "B",
    change: "+0.8",
    trend: "up",
  },
  {
    id: 5,
    date: "Aug 31, 2025",
    runway: 14.2,
    grade: "B",
    change: "+1.2",
    trend: "up",
  },
];

const DNAArchive = () => {
  const getGradeClass = (grade: string) => {
    const g = grade.toLowerCase();
    if (g === "a") return "bg-[hsl(152,100%,50%)] text-[hsl(152,100%,5%)]";
    if (g === "b") return "bg-[hsl(226,100%,59%)] text-white";
    return "bg-[hsl(45,90%,55%)] text-[hsl(45,100%,10%)]";
  };

  return (
    <div className="min-h-screen w-full p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient-cobalt mb-1">DNA Archive</h1>
            <p className="text-[hsl(220,10%,50%)] text-sm">
              Your financial evolution, tracked over time
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,10%,40%)]" />
            <Input
              placeholder="Search analyses..."
              className="pl-10 bg-[hsl(270,15%,10%)/0.6] border-[hsl(226,100%,59%)/0.1] text-white placeholder:text-[hsl(220,10%,40%)] focus:border-[hsl(226,100%,59%)/0.4]"
            />
          </div>
          <Button
            variant="outline"
            className="border-[hsl(226,100%,59%)/0.2] hover:border-[hsl(226,100%,59%)/0.4] text-[hsl(220,10%,70%)]"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </motion.header>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.15] flex items-center justify-center">
              <Archive className="w-5 h-5 text-[hsl(226,100%,59%)]" />
            </div>
            <span className="text-[hsl(220,10%,55%)] text-sm">Total Analyses</span>
          </div>
          <p className="text-4xl font-bold text-white">12</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(152,100%,50%)/0.15] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(152,100%,50%)]" />
            </div>
            <span className="text-[hsl(220,10%,55%)] text-sm">Average Runway</span>
          </div>
          <p className="text-4xl font-bold text-gradient-emerald">15.6</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(270,60%,50%)/0.15] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[hsl(270,60%,55%)]" />
            </div>
            <span className="text-[hsl(220,10%,55%)] text-sm">Last Analysis</span>
          </div>
          <p className="text-4xl font-bold text-white">3d</p>
        </div>
      </motion.div>

      {/* Analysis List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel overflow-hidden"
      >
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[hsl(226,100%,59%)]" />
            Recent Analyses
          </h2>
        </div>

        <div className="divide-y divide-white/5">
          {mockAnalyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${getGradeClass(analysis.grade)} flex items-center justify-center font-bold text-lg`}>
                    {analysis.grade}
                  </div>
                  <div>
                    <p className="text-white font-medium">{analysis.date}</p>
                    <p className="text-[hsl(220,10%,50%)] text-sm">
                      {analysis.runway} months runway
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    analysis.trend === "up" 
                      ? "text-[hsl(152,100%,50%)]" 
                      : "text-[hsl(0,70%,55%)]"
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${analysis.trend === "down" ? "rotate-180" : ""}`} />
                    {analysis.change} months
                  </div>
                  <ChevronRight className="w-5 h-5 text-[hsl(220,10%,40%)] group-hover:text-[hsl(226,100%,59%)] transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Empty state hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-[hsl(220,10%,40%)] text-sm mt-8"
      >
        Pro tip: Run monthly analyses to track your startup's trajectory
      </motion.p>
    </div>
  );
};

export default DNAArchive;
