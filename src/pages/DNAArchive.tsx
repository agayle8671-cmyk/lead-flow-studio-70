import { forwardRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Archive, Calendar, TrendingUp, TrendingDown, FileText, Search, ArrowUpDown, ArrowRight, Minus, ChevronUp, ChevronDown, GitCompare, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiUrl } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

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
}

const mockAnalyses: Analysis[] = [
  { id: 1, date: "Dec 28, 2025", runway: 18.4, grade: "A", change: "+2.1", trend: "up" },
  { id: 2, date: "Nov 30, 2025", runway: 16.3, grade: "A", change: "+1.8", trend: "up" },
  { id: 3, date: "Oct 31, 2025", runway: 14.5, grade: "B", change: "-0.5", trend: "down" },
  { id: 4, date: "Sep 30, 2025", runway: 15.0, grade: "B", change: "+0.8", trend: "up" },
  { id: 5, date: "Aug 31, 2025", runway: 14.2, grade: "B", change: "+1.2", trend: "up" },
];

type SortField = "date" | "grade" | "runway";

const DNAArchive = forwardRef<HTMLDivElement>((_, ref) => {
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [isLoading, setIsLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  // Fetch from API on mount
  useEffect(() => {
    const fetchArchive = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl("/api/archive"));
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item: any, index: number) => {
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
              } satisfies Analysis;
            });
            setAnalyses(mapped);
          }
        }
      } catch (error) {
        console.log("Archive fetch error:", error);
        // Use mock data if API unavailable
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchive();
  }, []);

  const getGradeClass = (grade: string) => {
    const g = grade.toLowerCase();
    if (g === "a") return "bg-[hsl(152,100%,50%)] text-[hsl(152,100%,5%)]";
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
    const sorted = [...analyses].sort((a, b) => {
      if (field === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (field === "grade") {
        return a.grade.localeCompare(b.grade);
      }
      if (field === "runway") {
        return b.runway - a.runway;
      }
      return 0;
    });
    setAnalyses(sorted);
  };

  const filteredAnalyses = analyses.filter(a =>
    a.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,10%,40%)]" />
            <Input
              placeholder="Search analyses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[hsl(270,15%,10%)/0.6] border-[hsl(226,100%,59%)/0.1] text-white placeholder:text-[hsl(220,10%,40%)]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[hsl(226,100%,59%)/0.2] hover:border-[hsl(226,100%,59%)/0.4] text-[hsl(220,10%,70%)]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[hsl(270,15%,10%)] border-[hsl(226,100%,59%)/0.2]">
              <DropdownMenuItem onClick={() => handleSort("date")} className="text-white hover:bg-[hsl(226,100%,59%)/0.1] cursor-pointer">
                By Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("grade")} className="text-white hover:bg-[hsl(226,100%,59%)/0.1] cursor-pointer">
                By Grade
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("runway")} className="text-white hover:bg-[hsl(226,100%,59%)/0.1] cursor-pointer">
                By Runway
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.15] flex items-center justify-center">
              <Archive className="w-5 h-5 text-[hsl(226,100%,59%)]" />
            </div>
            <span className="text-[hsl(220,10%,55%)] text-sm">Total Analyses</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(152,100%,50%)/0.15] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(152,100%,50%)]" />
            </div>
            <span className="text-[hsl(220,10%,55%)] text-sm">Average Runway</span>
          </div>
          <p className="text-4xl font-bold text-gradient-emerald">{stats.avgRunway}</p>
        </div>
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(270,60%,50%)/0.15] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[hsl(270,60%,55%)]" />
            </div>
            <span className="text-[hsl(220,10%,55%)] text-sm">Last Analysis</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.lastAnalysis}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[hsl(226,100%,59%)]" />
            Recent Analyses
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {filteredAnalyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
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
                  <div
                    className={`w-10 h-10 rounded-xl ${getGradeClass(analysis.grade)} flex items-center justify-center font-bold text-lg uppercase`}
                  >
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
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${analysis.trend === "up" ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}
                  >
                    <TrendingUp className={`w-4 h-4 ${analysis.trend === "down" ? "rotate-180" : ""}`} />
                    {analysis.change} months
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-[hsl(226,100%,59%)/0.2] shadow-2xl shadow-[hsl(226,100%,59%)/0.1]"
          >
            {/* Header with Glow */}
            <div className="relative p-8 pb-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(226,100%,59%)/0.1] via-transparent to-[hsl(152,100%,50%)/0.1]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-[hsl(226,100%,59%)/0.15] blur-[80px] rounded-full" />
              
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative flex items-center gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl ${getGradeClass(selectedAnalysis.grade)} flex items-center justify-center shadow-lg ${selectedAnalysis.grade.toLowerCase() === 'a' ? 'shadow-[hsl(152,100%,50%)/0.3]' : selectedAnalysis.grade.toLowerCase() === 'b' ? 'shadow-[hsl(226,100%,59%)/0.3]' : 'shadow-[hsl(45,90%,55%)/0.3]'}`}>
                  <span className="text-3xl font-bold">{selectedAnalysis.grade}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedAnalysis.date}</h2>
                  <p className="text-[hsl(220,10%,55%)]">Financial DNA Snapshot</p>
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
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(152,100%,50%)/0.08] via-[hsl(180,80%,45%)/0.05] to-[hsl(226,100%,59%)/0.08]" />
                <div className="absolute inset-0 backdrop-blur-xl bg-[hsl(240,7%,8%)/0.6]" />
                
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Runway Display */}
                  <div className="text-center md:text-left">
                    <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-wider mb-2">Runway at Time</p>
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
                    <div className={`flex items-center gap-2 mt-3 ${selectedAnalysis.trend === "up" ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}>
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
                  <div className="flex justify-between mt-2 text-xs text-[hsl(220,10%,45%)]">
                    <span>0</span>
                    <span>6 mo</span>
                    <span>12 mo</span>
                    <span>18 mo</span>
                    <span>24+ mo</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Metrics Grid */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-8 pb-6 grid grid-cols-2 gap-4"
            >
              <div className="p-5 rounded-2xl bg-[hsl(152,100%,50%)/0.08] border border-[hsl(152,100%,50%)/0.2]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(152,100%,50%)/0.2] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[hsl(152,100%,50%)]" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[hsl(152,100%,60%)]">Cash on Hand</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {typeof selectedAnalysis.cashOnHand === "number" ? `$${selectedAnalysis.cashOnHand.toLocaleString()}` : "—"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[hsl(0,70%,55%)/0.08] border border-[hsl(0,70%,55%)/0.2]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(0,70%,55%)/0.2] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[hsl(0,70%,55%)] rotate-180" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[hsl(0,70%,65%)]">Monthly Burn</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {typeof selectedAnalysis.monthlyBurn === "number" ? `$${selectedAnalysis.monthlyBurn.toLocaleString()}` : "—"}
                </p>
              </div>

              {selectedAnalysis.profitMargin !== undefined && (
                <div className="col-span-2 p-5 rounded-2xl bg-[hsl(226,100%,59%)/0.08] border border-[hsl(226,100%,59%)/0.2]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.2] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[hsl(226,100%,68%)]" />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-[hsl(226,100%,68%)]">Profit Margin</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{selectedAnalysis.profitMargin}%</p>
                </div>
              )}
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
                          <p className="text-[hsl(220,10%,55%)] text-sm">{previousAnalysis.date}</p>
                        </div>
                      </div>

                      {/* Comparison Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Runway Comparison */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5"
                        >
                          <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)] mb-2">Runway</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center">
                              <p className="text-xs text-[hsl(220,10%,45%)]">Previous</p>
                              <p className="text-lg font-bold text-[hsl(220,10%,65%)]">{previousAnalysis.runway.toFixed(1)}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[hsl(180,80%,50%)]" />
                            <div className="text-center">
                              <p className="text-xs text-[hsl(220,10%,45%)]">Current</p>
                              <p className="text-lg font-bold text-white">{selectedAnalysis.runway.toFixed(1)}</p>
                            </div>
                          </div>
                          {runwayDiff && (
                            <div className={`flex items-center justify-center gap-1 py-2 rounded-xl ${runwayDiff.trend === "up" ? "bg-[hsl(152,100%,50%)/0.15]" : runwayDiff.trend === "down" ? "bg-[hsl(0,70%,55%)/0.15]" : "bg-[hsl(220,10%,20%)]"}`}>
                              {runwayDiff.trend === "up" ? (
                                <ChevronUp className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                              ) : runwayDiff.trend === "down" ? (
                                <ChevronDown className="w-4 h-4 text-[hsl(0,70%,55%)]" />
                              ) : (
                                <Minus className="w-4 h-4 text-[hsl(220,10%,55%)]" />
                              )}
                              <span className={`text-sm font-semibold ${runwayDiff.trend === "up" ? "text-[hsl(152,100%,50%)]" : runwayDiff.trend === "down" ? "text-[hsl(0,70%,55%)]" : "text-[hsl(220,10%,55%)]"}`}>
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
                          className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5"
                        >
                          <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)] mb-2">Cash</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center">
                              <p className="text-xs text-[hsl(220,10%,45%)]">Previous</p>
                              <p className="text-lg font-bold text-[hsl(220,10%,65%)]">
                                {previousAnalysis.cashOnHand ? `$${(previousAnalysis.cashOnHand / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[hsl(180,80%,50%)]" />
                            <div className="text-center">
                              <p className="text-xs text-[hsl(220,10%,45%)]">Current</p>
                              <p className="text-lg font-bold text-white">
                                {selectedAnalysis.cashOnHand ? `$${(selectedAnalysis.cashOnHand / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                          </div>
                          {cashDiff && (
                            <div className={`flex items-center justify-center gap-1 py-2 rounded-xl ${cashDiff.trend === "up" ? "bg-[hsl(152,100%,50%)/0.15]" : cashDiff.trend === "down" ? "bg-[hsl(0,70%,55%)/0.15]" : "bg-[hsl(220,10%,20%)]"}`}>
                              {cashDiff.trend === "up" ? (
                                <ChevronUp className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                              ) : cashDiff.trend === "down" ? (
                                <ChevronDown className="w-4 h-4 text-[hsl(0,70%,55%)]" />
                              ) : (
                                <Minus className="w-4 h-4 text-[hsl(220,10%,55%)]" />
                              )}
                              <span className={`text-sm font-semibold ${cashDiff.trend === "up" ? "text-[hsl(152,100%,50%)]" : cashDiff.trend === "down" ? "text-[hsl(0,70%,55%)]" : "text-[hsl(220,10%,55%)]"}`}>
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
                          className="p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5"
                        >
                          <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)] mb-2">Burn Rate</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center">
                              <p className="text-xs text-[hsl(220,10%,45%)]">Previous</p>
                              <p className="text-lg font-bold text-[hsl(220,10%,65%)]">
                                {previousAnalysis.monthlyBurn ? `$${(previousAnalysis.monthlyBurn / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[hsl(180,80%,50%)]" />
                            <div className="text-center">
                              <p className="text-xs text-[hsl(220,10%,45%)]">Current</p>
                              <p className="text-lg font-bold text-white">
                                {selectedAnalysis.monthlyBurn ? `$${(selectedAnalysis.monthlyBurn / 1000).toFixed(0)}k` : "—"}
                              </p>
                            </div>
                          </div>
                          {burnDiff && (
                            <div className={`flex items-center justify-center gap-1 py-2 rounded-xl ${burnDiff.trend === "down" ? "bg-[hsl(152,100%,50%)/0.15]" : burnDiff.trend === "up" ? "bg-[hsl(0,70%,55%)/0.15]" : "bg-[hsl(220,10%,20%)]"}`}>
                              {burnDiff.trend === "down" ? (
                                <ChevronDown className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                              ) : burnDiff.trend === "up" ? (
                                <ChevronUp className="w-4 h-4 text-[hsl(0,70%,55%)]" />
                              ) : (
                                <Minus className="w-4 h-4 text-[hsl(220,10%,55%)]" />
                              )}
                              <span className={`text-sm font-semibold ${burnDiff.trend === "down" ? "text-[hsl(152,100%,50%)]" : burnDiff.trend === "up" ? "text-[hsl(0,70%,55%)]" : "text-[hsl(220,10%,55%)]"}`}>
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
                        className="mt-4 p-4 rounded-2xl bg-[hsl(240,7%,10%)] border border-white/5"
                      >
                        <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)] mb-3">Grade Evolution</p>
                        <div className="flex items-center justify-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-[hsl(220,10%,45%)] mb-2">Previous</p>
                            <div className={`w-14 h-14 rounded-xl ${getGradeClass(previousAnalysis.grade)} flex items-center justify-center font-bold text-2xl opacity-60`}>
                              {previousAnalysis.grade}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <ArrowRight className="w-8 h-8 text-[hsl(180,80%,50%)]" />
                            {previousAnalysis.grade !== selectedAnalysis.grade && (
                              <span className={`text-xs font-semibold mt-1 ${selectedAnalysis.grade < previousAnalysis.grade ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"}`}>
                                {selectedAnalysis.grade < previousAnalysis.grade ? "Improved!" : "Declined"}
                              </span>
                            )}
                            {previousAnalysis.grade === selectedAnalysis.grade && (
                              <span className="text-xs font-semibold mt-1 text-[hsl(220,10%,55%)]">
                                Maintained
                              </span>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[hsl(220,10%,45%)] mb-2">Current</p>
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
                        className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[hsl(152,100%,50%)/0.05] via-[hsl(180,80%,45%)/0.03] to-[hsl(226,100%,59%)/0.05] border border-[hsl(152,100%,50%)/0.15]"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(152,100%,50%)/0.3] to-[hsl(180,80%,45%)/0.3] flex items-center justify-center">
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
                              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(152,100%,50%)/0.1] to-transparent blur-xl" />
                              
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
                                  <p className="text-xs text-[hsl(220,10%,45%)]">Min</p>
                                  <p className="text-sm font-bold text-[hsl(0,70%,60%)]">{minRunway.toFixed(1)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-[hsl(220,10%,45%)]">Average</p>
                                  <p className="text-sm font-bold text-[hsl(180,80%,55%)]">{avgRunway.toFixed(1)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-[hsl(220,10%,45%)]">Max</p>
                                  <p className="text-sm font-bold text-[hsl(152,100%,55%)]">{maxRunway.toFixed(1)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-[hsl(220,10%,45%)]">Trend</p>
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

            {/* Close Button */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-8 pb-8 flex justify-center"
            >
              <Button 
                onClick={() => setDetailOpen(false)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(270,60%,55%)] hover:from-[hsl(226,100%,65%)] hover:to-[hsl(270,60%,60%)] text-white font-semibold shadow-lg shadow-[hsl(226,100%,59%)/0.3] transition-all"
              >
                Close Analysis
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
});

DNAArchive.displayName = "DNAArchive";

export default DNAArchive;
