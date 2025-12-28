import { forwardRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Archive, Calendar, TrendingUp, FileText, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    toast({ title: "Sorted", description: `Sorted by ${field}` });
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[hsl(270,15%,10%)] border-[hsl(226,100%,59%)/0.2] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-cobalt">
              {selectedAnalysis ? `Analysis — ${selectedAnalysis.date}` : "Analysis"}
            </DialogTitle>
            <DialogDescription className="text-[hsl(220,10%,55%)]">
              Review your runway snapshot.
            </DialogDescription>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5">
                  <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)]">Grade</p>
                  <p className="mt-1 text-2xl font-bold text-white">{selectedAnalysis.grade}</p>
                </div>
                <div className="p-4 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5">
                  <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)]">Runway</p>
                  <p className="mt-1 text-2xl font-bold text-white">{selectedAnalysis.runway} months</p>
                </div>
                <div className="p-4 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5">
                  <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)]">Monthly Burn</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {typeof selectedAnalysis.monthlyBurn === "number" ? `$${selectedAnalysis.monthlyBurn.toLocaleString()}` : "—"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5">
                  <p className="text-xs uppercase tracking-wider text-[hsl(220,10%,55%)]">Cash on Hand</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {typeof selectedAnalysis.cashOnHand === "number" ? `$${selectedAnalysis.cashOnHand.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              {selectedAnalysis.insight && (
                <div className="p-4 rounded-xl bg-[hsl(226,100%,59%)/0.08] border border-[hsl(226,100%,59%)/0.2]">
                  <p className="text-xs uppercase tracking-wider text-[hsl(226,100%,68%)] mb-2">Insight</p>
                  <p className="text-[hsl(220,10%,70%)] leading-relaxed">{selectedAnalysis.insight}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

DNAArchive.displayName = "DNAArchive";

export default DNAArchive;
