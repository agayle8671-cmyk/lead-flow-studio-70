import { forwardRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Archive, Calendar, TrendingUp, FileText, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiUrl } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
