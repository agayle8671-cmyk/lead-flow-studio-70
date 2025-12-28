import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  Dna, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Download, 
  Share2,
  Zap,
  Target,
  BarChart3,
  FileImage,
  FileText,
  Copy,
  MessageSquare,
  ClipboardCheck,
  Clock,
  X,
  ArrowRight,
  AlertTriangle,
  Activity,
  Bell,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/config";
import { useApp, DriftAnomaly } from "@/contexts/AppContext";
import { 
  exportAsPNG, 
  exportAsPDF, 
  shareToTwitter,
  generateInvestorUpdate,
  generateSlackUpdate,
  generateQuickStatus,
  downloadAsFile,
  copyToClipboard
} from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FinancialData {
  runway_months: number;
  grade: string;
  monthly_burn: number;
  cash_on_hand: number;
  profit_margin: number;
  revenue_trend: number[];
  expense_trend: number[];
  insight: string;
}

type ProcessingStage = "idle" | "decoding" | "mapping" | "simulating" | "complete";

const STAGE_MESSAGES: Record<ProcessingStage, string> = {
  idle: "",
  decoding: "Analyzing financial data...",
  mapping: "Mapping revenue patterns...",
  simulating: "Calculating runway...",
  complete: "Analysis Complete"
};

const DEMO_DATA: FinancialData = {
  runway_months: 18.4,
  grade: "A",
  monthly_burn: 42500,
  cash_on_hand: 765000,
  profit_margin: 24.7,
  revenue_trend: [45, 52, 48, 61, 58, 72, 78, 85, 92],
  expense_trend: [38, 41, 39, 44, 42, 48, 51, 54, 58],
  insight: "Strong burn efficiency. Top 12% of funded startups."
};

function sanitizeFinancialData(raw: Partial<FinancialData>): FinancialData {
  const cashOnHand = Math.max(0, Number(raw.cash_on_hand) || 0);
  const monthlyBurn = Math.max(0, Number(raw.monthly_burn) || 0);
  const profitMargin = Number(raw.profit_margin) ?? 0;
  
  let runwayMonths: number;
  if (raw.runway_months !== undefined && raw.runway_months !== null) {
    runwayMonths = Number(raw.runway_months);
  } else if (monthlyBurn === 0) {
    runwayMonths = Infinity;
  } else {
    runwayMonths = cashOnHand / monthlyBurn;
  }
  
  if (!isFinite(runwayMonths) || isNaN(runwayMonths)) {
    runwayMonths = monthlyBurn === 0 ? Infinity : 0;
  }

  let grade = (raw.grade || "").toUpperCase();
  if (!["A", "B", "C", "D", "F"].includes(grade)) {
    grade = calculateGrade(runwayMonths, profitMargin, monthlyBurn, cashOnHand);
  }

  let insight = raw.insight || "";
  if (!insight) {
    insight = generateInsight(runwayMonths, profitMargin, monthlyBurn, grade);
  }

  return {
    runway_months: runwayMonths,
    grade,
    monthly_burn: monthlyBurn,
    cash_on_hand: cashOnHand,
    profit_margin: profitMargin,
    revenue_trend: raw.revenue_trend || [40, 45, 50, 55, 60, 65, 70],
    expense_trend: raw.expense_trend || [35, 38, 40, 42, 45, 48, 52],
    insight,
  };
}

function calculateGrade(
  runwayMonths: number, 
  profitMargin: number, 
  monthlyBurn: number,
  cashOnHand: number
): string {
  if (monthlyBurn === 0 && cashOnHand > 0) return "A";
  if (!isFinite(runwayMonths) || runwayMonths > 36) return profitMargin >= 0 ? "A" : "B";
  if (runwayMonths >= 18) return profitMargin >= 10 ? "A" : "B";
  if (runwayMonths >= 12) return profitMargin >= 0 ? "B" : "C";
  if (runwayMonths >= 6) return "C";
  if (runwayMonths >= 3) return "D";
  return "F";
}

function generateInsight(
  runwayMonths: number, 
  profitMargin: number, 
  monthlyBurn: number,
  grade: string
): string {
  if (!isFinite(runwayMonths) || runwayMonths > 36) {
    if (monthlyBurn === 0 && profitMargin <= 0) {
      return "Pre-revenue with zero burn. Focus on product-market fit.";
    }
    if (profitMargin > 0) {
      return "Profitable operations. Consider growth acceleration.";
    }
    return "Extended runway. Strong position for growth.";
  }

  switch (grade) {
    case "A": return "Strong burn efficiency. Top 12% of funded startups.";
    case "B": return "Healthy position. Continue optimizing unit economics.";
    case "C": return "Moderate runway. Consider cost optimization.";
    case "D": return "Short runway. Prioritize extending runway.";
    default: return "Critical runway. Take immediate action.";
  }
}

interface HistoricalData extends FinancialData {
  isHistorical?: boolean;
  historicalDate?: string;
}

interface DriftResult {
  hasDrift: boolean;
  driftType: "burn" | "runway" | "revenue";
  actualValue: number;
  predictedValue: number;
  driftPercentage: number;
  snapshotDate: string;
  message: string;
  severity: "low" | "medium" | "high";
  exceedsThreshold: boolean;
}

const DNALab = () => {
  const navigate = useNavigate();
  const { addDriftAnomaly } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [data, setData] = useState<HistoricalData | null>(null);
  const [displayedRunway, setDisplayedRunway] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  const [driftResult, setDriftResult] = useState<DriftResult | null>(null);
  const [driftSaved, setDriftSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectFinancialDrift = useCallback(async (currentData: FinancialData): Promise<DriftResult | null> => {
    try {
      const storedArchive = localStorage.getItem("runwayDNA_archive");
      let latestSnapshot: any = null;
      
      if (storedArchive) {
        const archive = JSON.parse(storedArchive);
        latestSnapshot = archive.find((entry: any) => 
          entry.entryType === "SIMULATION" || entry.entry_type === "SIMULATION"
        );
        if (!latestSnapshot && archive.length > 0) {
          latestSnapshot = archive[0];
        }
      }
      
      if (!latestSnapshot) {
        try {
          const response = await fetch(apiUrl("/api/archive?limit=1&type=SIMULATION"));
          if (response.ok) {
            const apiData = await response.json();
            if (apiData.length > 0) latestSnapshot = apiData[0];
          }
        } catch { /* API unavailable */ }
      }
      
      if (!latestSnapshot) return null;
      
      const predictedBurn = latestSnapshot.scenarioB?.monthly_expenses || 
                            latestSnapshot.monthlyBurn || 
                            latestSnapshot.monthly_burn || 0;
      
      const predictedRunway = latestSnapshot.scenarioB?.runway_months || 
                              latestSnapshot.runway || latestSnapshot.runway_months || 0;
      
      const actualBurn = currentData.monthly_burn;
      const actualRunway = currentData.runway_months;
      
      let burnDrift = 0;
      if (predictedBurn > 0) {
        burnDrift = ((actualBurn - predictedBurn) / predictedBurn) * 100;
      }
      
      let runwayDrift = 0;
      if (predictedRunway > 0 && isFinite(actualRunway)) {
        runwayDrift = ((actualRunway - predictedRunway) / predictedRunway) * 100;
      }
      
      const absB = Math.abs(burnDrift);
      const absR = Math.abs(runwayDrift);
      
      const snapshotDate = new Date(latestSnapshot.date || latestSnapshot.created_at || Date.now());
      const snapshotDateStr = snapshotDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      
      if (absB >= absR && absB >= 3) {
        const severity = absB >= 15 ? "high" : absB >= 8 ? "medium" : "low";
        const direction = burnDrift > 0 ? "higher" : "lower";
        
        return {
          hasDrift: true,
          driftType: "burn",
          actualValue: actualBurn,
          predictedValue: predictedBurn,
          driftPercentage: burnDrift,
          snapshotDate: snapshotDateStr,
          message: `Expenses are ${Math.abs(burnDrift).toFixed(0)}% ${direction} than your ${snapshotDateStr} simulation`,
          severity,
          exceedsThreshold: absB > 5,
        };
      }
      
      if (absR >= 3) {
        const severity = absR >= 20 ? "high" : absR >= 10 ? "medium" : "low";
        const direction = runwayDrift > 0 ? "longer" : "shorter";
        
        return {
          hasDrift: true,
          driftType: "runway",
          actualValue: actualRunway,
          predictedValue: predictedRunway,
          driftPercentage: runwayDrift,
          snapshotDate: snapshotDateStr,
          message: `Runway is ${Math.abs(runwayDrift).toFixed(0)}% ${direction} than your ${snapshotDateStr} simulation`,
          severity,
          exceedsThreshold: absR > 5,
        };
      }
      
      return null;
    } catch (error) {
      console.error("Failed to detect financial drift:", error);
      return null;
    }
  }, []);
  
  const handleSaveToWeeklyBrief = useCallback(() => {
    if (!driftResult) return;
    
    const anomaly: DriftAnomaly = {
      id: `drift-${Date.now()}`,
      date: new Date().toISOString(),
      type: driftResult.driftType,
      actualValue: driftResult.actualValue,
      predictedValue: driftResult.predictedValue,
      driftPercentage: driftResult.driftPercentage,
      snapshotDate: driftResult.snapshotDate,
      message: driftResult.message,
    };
    
    addDriftAnomaly(anomaly);
    setDriftSaved(true);
    
    toast({
      title: "Added to Weekly Brief",
      description: "This anomaly will appear in your Scale Hub notifications.",
    });
  }, [driftResult, addDriftAnomaly]);
  
  useEffect(() => {
    if (stage === "complete" && data && !isHistoricalView) {
      detectFinancialDrift(data).then((result) => {
        setDriftResult(result);
        setDriftSaved(false);
        
        if (result?.exceedsThreshold) {
          fetch(apiUrl("/api/drift-alert"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...result, timestamp: new Date().toISOString() }),
          }).catch(() => {});
        }
      });
    }
  }, [stage, data, isHistoricalView, detectFinancialDrift]);
  
  const handleRunwayClick = () => {
    if (data) {
      sessionStorage.setItem("runwayDNA_initialData", JSON.stringify({
        monthly_burn: data.monthly_burn,
        cash_on_hand: data.cash_on_hand,
        runway_months: data.runway_months
      }));
      navigate("/toolkit?tool=runway");
    }
  };
  
  const handleGradeClick = () => navigate("/archive");
  
  const handleBurnClick = () => {
    if (data) {
      sessionStorage.setItem("runwayDNA_initialData", JSON.stringify({
        monthly_burn: data.monthly_burn,
        cash_on_hand: data.cash_on_hand
      }));
      navigate("/toolkit?tool=burn");
    }
  };
  
  const handleCashClick = () => {
    if (data) {
      sessionStorage.setItem("runwayDNA_initialData", JSON.stringify({
        monthly_burn: data.monthly_burn,
        cash_on_hand: data.cash_on_hand,
        runway_months: data.runway_months
      }));
      navigate("/toolkit?tool=runway");
    }
  };
  
  const handleProfitClick = () => {
    if (data) {
      sessionStorage.setItem("runwayDNA_initialData", JSON.stringify({
        monthly_burn: data.monthly_burn,
        cash_on_hand: data.cash_on_hand
      }));
      navigate("/toolkit?tool=growth");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("historical") === "true") {
      const storedHistorical = sessionStorage.getItem("runwayDNA_historical");
      if (storedHistorical) {
        try {
          const historicalData = JSON.parse(storedHistorical) as HistoricalData;
          setData(historicalData);
          setIsHistoricalView(true);
          setStage("complete");
          window.history.replaceState({}, "", "/");
          sessionStorage.removeItem("runwayDNA_historical");
          
          toast({
            title: "Historical View",
            description: `Viewing snapshot from ${historicalData.historicalDate}`,
          });
        } catch (e) {
          console.error("Failed to parse historical data:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (data && stage === "complete") {
      if (!isFinite(data.runway_months)) {
        setDisplayedRunway(data.runway_months);
        return;
      }
      
      const target = data.runway_months;
      const duration = 1200;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayedRunway(target);
          clearInterval(timer);
        } else {
          setDisplayedRunway(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [data, stage]);

  const processFile = async (file: File) => {
    setStage("decoding");
    await new Promise(r => setTimeout(r, 800));
    setStage("mapping");
    await new Promise(r => setTimeout(r, 800));
    setStage("simulating");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(apiUrl("/api/parse-finances"), {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: "include",
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();
      const dnaData = result.dna || result;
      const sanitizedData = sanitizeFinancialData(dnaData);
      setData(sanitizedData);
    } catch {
      setData(DEMO_DATA);
      toast({
        title: "Demo Mode",
        description: "Showing sample data for demonstration.",
      });
    }

    setStage("complete");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      processFile(file);
    } else {
      toast({
        title: "Invalid Format",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive"
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDemoMode = () => {
    setStage("decoding");
    setTimeout(() => setStage("mapping"), 600);
    setTimeout(() => setStage("simulating"), 1200);
    setTimeout(() => {
      setData(DEMO_DATA);
      setStage("complete");
    }, 1800);
  };

  const resetAnalysis = () => {
    setStage("idle");
    setData(null);
    setDisplayedRunway(0);
    setDriftResult(null);
  };

  const handleExportPNG = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      await exportAsPNG("health-card-export", `runway-dna-${data.grade}-${Date.now()}.png`);
      toast({ title: "Exported", description: "Health Card downloaded as PNG." });
    } catch {
      toast({ title: "Export Failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      await exportAsPDF("health-card-export", `runway-dna-${data.grade}-${Date.now()}.pdf`);
      toast({ title: "Exported", description: "Health Card downloaded as PDF." });
    } catch {
      toast({ title: "Export Failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (!data) return;
    shareToTwitter(data);
  };

  const handleDownloadReport = () => {
    if (!data) return;
    const scenarios = {
      optimistic: { runway: Math.min(data.runway_months * 1.5, 24), description: "High growth scenario" },
      current: { runway: data.runway_months, description: "Current trajectory" },
      danger: { runway: Math.max(data.runway_months * 0.6, 2), description: "Conservative scenario" },
    };
    const report = generateInvestorUpdate(data, scenarios);
    downloadAsFile(report, `Runway-DNA-Report-${new Date().toISOString().split('T')[0]}.md`);
    toast({ title: "Downloaded", description: "Report saved as Markdown." });
  };

  const handleCopyInvestorUpdate = async () => {
    if (!data) return;
    const scenarios = {
      optimistic: { runway: Math.min(data.runway_months * 1.5, 24), description: "High growth" },
      current: { runway: data.runway_months, description: "Current" },
      danger: { runway: Math.max(data.runway_months * 0.6, 2), description: "Conservative" },
    };
    const report = generateInvestorUpdate(data, scenarios);
    const success = await copyToClipboard(report);
    toast({ title: success ? "Copied" : "Failed", description: success ? "Ready to paste." : "Try again." });
  };

  const handleCopyForSlack = async () => {
    if (!data) return;
    const success = await copyToClipboard(generateSlackUpdate(data));
    toast({ title: success ? "Copied" : "Failed" });
  };

  const handleCopyQuickStatus = async () => {
    if (!data) return;
    const success = await copyToClipboard(generateQuickStatus(data));
    toast({ title: success ? "Copied" : "Failed" });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  // Spring transition config - Superlist style
  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  };

  const Sparkline = ({ data: chartData, positive = true }: { data: number[]; positive?: boolean }) => {
    const max = Math.max(...chartData);
    const min = Math.min(...chartData);
    const range = max - min || 1;
    const points = chartData.map((value, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(" ");
    const color = positive ? "#22C55E" : "#0099FF";

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-${positive}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill={`url(#spark-${positive})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const getGradeColor = (grade: string) => {
    const g = grade.toLowerCase();
    if (g === "a") return "bg-[#22C55E] text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]";
    if (g === "b") return "bg-[#0099FF] text-white shadow-[0_0_30px_rgba(0,153,255,0.4)]";
    if (g === "c") return "bg-[#F59E0B] text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]";
    return "bg-[#DC2626] text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]";
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header - Architectural */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="px-12 pt-16 pb-12 border-b border-white/[0.06] flex items-end justify-between"
      >
        <div>
          <p className="text-[11px] tracking-[0.3em] text-white/30 uppercase mb-4">
            Financial Analysis
          </p>
          <h1 className="text-[42px] font-light text-white tracking-tight leading-none">
            Lab
          </h1>
        </div>
        {stage === "complete" && (
          <motion.button 
            onClick={resetAnalysis}
            className="text-[11px] tracking-[0.15em] text-white/40 uppercase hover:text-white transition-colors duration-300"
            whileHover={{ x: 4 }}
          >
            New Analysis →
          </motion.button>
        )}
      </motion.header>

      <AnimatePresence mode="wait">
        {/* IDLE STATE - Architectural */}
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-12 py-24"
          >
            <div
              className={`border border-white/[0.08] cursor-pointer transition-all duration-300 ${
                isDragging ? "border-white/30 bg-white/[0.02]" : "hover:border-white/15"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="py-32 px-12 text-center">
                <motion.p 
                  className="text-[11px] tracking-[0.3em] text-white/30 uppercase mb-6"
                  animate={{ opacity: isDragging ? 1 : 0.6 }}
                >
                  {isDragging ? "Release to analyze" : "Drop file here"}
                </motion.p>

                <h2 className="text-[32px] font-light text-white mb-4 tracking-tight">
                  Upload Financial Data
                </h2>

                <p className="text-[13px] text-white/40 mb-12 max-w-md mx-auto leading-relaxed">
                  CSV or Excel file with bank exports, Stripe data, or financial spreadsheet
                </p>

                <div className="flex items-center justify-center gap-8">
                  <motion.span 
                    className="text-[11px] tracking-[0.15em] text-white/50 uppercase cursor-pointer hover:text-white transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    Choose File →
                  </motion.span>
                  <span className="text-white/20">|</span>
                  <motion.span 
                    className="text-[11px] tracking-[0.15em] text-white/50 uppercase cursor-pointer hover:text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDemoMode(); }}
                    whileHover={{ x: 4 }}
                  >
                    View Demo →
                  </motion.span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-12">
              <p className="text-[10px] tracking-[0.2em] text-white/20 uppercase">
                Encrypted
              </p>
              <p className="text-[10px] tracking-[0.2em] text-white/20 uppercase">
                Private
              </p>
              <p className="text-[10px] tracking-[0.2em] text-white/20 uppercase">
                Secure
              </p>
            </div>
          </motion.div>
        )}

        {/* PROCESSING STATE - Minimal */}
        {(stage === "decoding" || stage === "mapping" || stage === "simulating") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-12 py-32 text-center"
          >
            <p className="text-[11px] tracking-[0.3em] text-white/30 uppercase mb-8">
              Processing
            </p>

            <h2 className="text-[28px] font-light text-white mb-6 tracking-tight">
              {STAGE_MESSAGES[stage]}
            </h2>

            <div className="flex justify-center gap-3">
              {["decoding", "mapping", "simulating"].map((s, i) => {
                const stages = ["decoding", "mapping", "simulating"];
                const currentIndex = stages.indexOf(stage);
                const isActive = i <= currentIndex;
                return (
                  <motion.div
                    key={s}
                    className="w-8 h-[1px]"
                    animate={{ 
                      backgroundColor: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.1)" 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* COMPLETE STATE - Architectural Grid */}
        {stage === "complete" && data && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={springTransition}
            id="health-card-export"
          >
            {/* Historical Banner */}
            {isHistoricalView && (data as HistoricalData).historicalDate && (
              <div className="px-12 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase">
                  Historical Snapshot · {(data as HistoricalData).historicalDate}
                </p>
                <motion.button
                  onClick={() => { setIsHistoricalView(false); resetAnalysis(); }}
                  className="text-[11px] tracking-[0.15em] text-white/40 uppercase hover:text-white transition-colors"
                  whileHover={{ x: 4 }}
                >
                  Exit →
                </motion.button>
              </div>
            )}

            {/* Main Grid - Architectural */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Runway */}
              <motion.div
                className="border-b border-r border-white/[0.06] cursor-pointer group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...springTransition, delay: 0.1 }}
                onClick={handleRunwayClick}
              >
                <div className="p-12 min-h-[200px] flex flex-col justify-between relative">
                  <p className="text-[11px] tracking-[0.2em] text-white/30 uppercase">
                    Runway
                  </p>
                  <div>
                    <span className="text-[64px] font-light text-white tabular-nums tracking-tighter leading-none">
                      {!isFinite(data.runway_months) ? "∞" : displayedRunway.toFixed(1)}
                    </span>
                    <span className="text-[18px] font-light text-white/30 ml-2">
                      months
                    </span>
                  </div>
                  
                  {/* Hover indicator */}
                  <motion.div
                    className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  />
                </div>
              </motion.div>

              {/* Grade */}
              <motion.div
                className="col-span-12 md:col-span-6 card-surface-hover p-8 cursor-pointer text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={handleGradeClick}
              >
                <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-6">
                  Health Grade
                </p>
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl text-5xl font-semibold ${getGradeColor(data.grade)}`}>
                  {data.grade.toUpperCase()}
                </div>
                <p className="text-white/50 mt-6 text-sm max-w-xs mx-auto">
                  {data.insight}
                </p>
              </motion.div>

              {/* Burn */}
              <motion.div
                className="col-span-12 md:col-span-4 card-surface-hover p-6 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleBurnClick}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-4 h-4 text-[hsl(0,100%,62%)]" />
                  <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                    Monthly Burn
                  </p>
                </div>
                <p className="text-2xl font-semibold text-white mb-4">
                  {data.monthly_burn === 0 ? "—" : formatCurrency(data.monthly_burn)}
                </p>
                <Sparkline data={data.expense_trend} positive={false} />
              </motion.div>

              {/* Cash */}
              <motion.div
                className="col-span-12 md:col-span-4 card-surface-hover p-6 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={handleCashClick}
              >
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-[#22C55E]" />
                  <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                    Cash on Hand
                  </p>
                </div>
                <p className="text-2xl font-semibold text-[#22C55E] mb-4">
                  {formatCurrency(data.cash_on_hand)}
                </p>
                <Sparkline data={data.revenue_trend} positive={true} />
              </motion.div>

              {/* Margin */}
              <motion.div
                className="col-span-12 md:col-span-4 card-surface-hover p-6 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleProfitClick}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Percent className="w-4 h-4 text-[#0099FF]" />
                  <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                    Profit Margin
                  </p>
                </div>
                <p className="text-2xl font-semibold text-white mb-4">
                  {data.profit_margin.toFixed(1)}%
                </p>
                <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#0099FF] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.max(data.profit_margin, 0) * 2, 100)}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </div>
              </motion.div>

              {/* Drift Alert */}
              {driftResult && (
                <motion.div
                  className={`col-span-12 card-surface p-6 border-l-4 ${
                    driftResult.severity === "high" ? "border-l-[hsl(0,100%,62%)]" :
                    driftResult.severity === "medium" ? "border-l-[hsl(35,100%,52%)]" :
                    "border-l-[hsl(211,100%,45%)]"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        driftResult.severity === "high" ? "bg-[hsl(0,100%,62%,0.15)]" :
                        driftResult.severity === "medium" ? "bg-[hsl(35,100%,52%,0.15)]" :
                        "bg-[hsl(211,100%,45%,0.15)]"
                      }`}>
                        {driftResult.severity === "high" ? (
                          <AlertTriangle className="w-5 h-5 text-[hsl(0,100%,62%)]" />
                        ) : (
                          <Activity className={`w-5 h-5 ${
                            driftResult.severity === "medium" ? "text-[hsl(35,100%,52%)]" : "text-[#0099FF]"
                          }`} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-white/50 mb-1">
                          Drift Detected
                        </p>
                        <p className="text-white font-medium mb-2">{driftResult.message}</p>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>Predicted: {driftResult.driftType === "burn" ? formatCurrency(driftResult.predictedValue) : `${driftResult.predictedValue.toFixed(1)} mo`}</span>
                          <ArrowRight className="w-4 h-4" />
                          <span className={driftResult.driftPercentage > 0 ? "text-[hsl(0,100%,62%)]" : "text-[#22C55E]"}>
                            Actual: {driftResult.driftType === "burn" ? formatCurrency(driftResult.actualValue) : `${driftResult.actualValue.toFixed(1)} mo`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleSaveToWeeklyBrief}
                        disabled={driftSaved}
                      >
                        {driftSaved ? <CheckCircle className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                        {driftSaved ? "Saved" : "Save to Brief"}
                      </Button>
                      <Button size="sm" onClick={() => navigate("/toolkit?tool=runway")}>
                        Adjust
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                className="col-span-12 card-surface p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0099FF] flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Export & Share</p>
                      <p className="text-sm text-white/50">Download or share your analysis</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" disabled={isExporting}>
                          <Download className="w-4 h-4 mr-2" />
                          {isExporting ? "Exporting..." : "Download"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleExportPNG}>
                          <FileImage className="w-4 h-4 mr-2" />
                          PNG Image
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>
                          <FileText className="w-4 h-4 mr-2" />
                          PDF Document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadReport}>
                          <FileText className="w-4 h-4 mr-2" />
                          Investor Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleCopyInvestorUpdate}>
                          <ClipboardCheck className="w-4 h-4 mr-2" />
                          Investor Update
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyForSlack}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Slack Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyQuickStatus}>
                          <Zap className="w-4 h-4 mr-2" />
                          Quick Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DNALab;
