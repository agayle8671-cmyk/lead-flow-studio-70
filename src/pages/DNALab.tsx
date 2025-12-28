import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/config";
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
  decoding: "Parsing Financial DNA Strings...",
  mapping: "Sequencing Revenue Genome...",
  simulating: "Simulating Survival Horizon...",
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
  insight: "Elite burn efficiency detected. You're in the top 12% of funded startups. Classification: Blitzscaler."
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARIES & EDGE CASE HANDLING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sanitize and validate financial data from the API
 * Handles edge cases: zero burn, zero revenue, negative values, Infinity
 */
function sanitizeFinancialData(raw: Partial<FinancialData>): FinancialData {
  // Extract raw values with safe defaults
  const cashOnHand = Math.max(0, Number(raw.cash_on_hand) || 0);
  const monthlyBurn = Math.max(0, Number(raw.monthly_burn) || 0);
  const profitMargin = Number(raw.profit_margin) ?? 0;
  
  // Calculate runway with edge case handling
  let runwayMonths: number;
  if (raw.runway_months !== undefined && raw.runway_months !== null) {
    runwayMonths = Number(raw.runway_months);
  } else if (monthlyBurn === 0) {
    // Zero burn = infinite runway (profitable or pre-revenue with no spend)
    runwayMonths = Infinity;
  } else {
    runwayMonths = cashOnHand / monthlyBurn;
  }
  
  // Handle Infinity and NaN
  if (!isFinite(runwayMonths) || isNaN(runwayMonths)) {
    runwayMonths = monthlyBurn === 0 ? Infinity : 0;
  }

  // Determine grade with edge case handling
  let grade = (raw.grade || "").toUpperCase();
  if (!["A", "B", "C", "D", "F"].includes(grade)) {
    grade = calculateGrade(runwayMonths, profitMargin, monthlyBurn, cashOnHand);
  }

  // Generate appropriate insight for edge cases
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

/**
 * Calculate grade based on financial metrics
 * Handles pre-revenue startups (revenue=0 but high runway)
 */
function calculateGrade(
  runwayMonths: number, 
  profitMargin: number, 
  monthlyBurn: number,
  cashOnHand: number
): string {
  // Pre-revenue startup with fresh funding (zero/low burn, high cash)
  if (monthlyBurn === 0 && cashOnHand > 0) {
    return "A"; // Infinite runway = healthy position
  }
  
  // Infinite runway (profitable company)
  if (!isFinite(runwayMonths) || runwayMonths > 36) {
    return profitMargin >= 0 ? "A" : "B";
  }

  // Standard grading based on runway
  if (runwayMonths >= 18) {
    return profitMargin >= 10 ? "A" : "B";
  }
  if (runwayMonths >= 12) {
    return profitMargin >= 0 ? "B" : "C";
  }
  if (runwayMonths >= 6) {
    return "C";
  }
  if (runwayMonths >= 3) {
    return "D";
  }
  return "F";
}

/**
 * Generate contextual insight based on edge cases
 */
function generateInsight(
  runwayMonths: number, 
  profitMargin: number, 
  monthlyBurn: number,
  grade: string
): string {
  // Infinite runway cases
  if (!isFinite(runwayMonths) || runwayMonths > 36) {
    if (monthlyBurn === 0 && profitMargin <= 0) {
      return "Pre-revenue with zero burn detected. You're in capital preservation mode. Focus on product-market fit.";
    }
    if (profitMargin > 0) {
      return "Profitable operations detected. You've achieved sustainability. Consider growth acceleration.";
    }
    return "Extended runway detected. Strong position for strategic growth or fundraising leverage.";
  }

  // Standard insights by grade
  switch (grade) {
    case "A":
      return "Elite burn efficiency detected. You're in the top 12% of funded startups. Classification: Blitzscaler.";
    case "B":
      return "Strong financial position. Well-managed burn with healthy runway. Continue optimizing unit economics.";
    case "C":
      return "Moderate runway detected. Consider cost optimization or revenue acceleration before next raise.";
    case "D":
      return "Short runway alert. Prioritize extending runway through cost cuts or bridge financing.";
    default:
      return "Critical runway. Take immediate action to reduce burn or secure emergency funding.";
  }
}

/**
 * Format runway for display - handles Infinity
 */
function formatRunway(months: number): string {
  if (!isFinite(months)) return "∞";
  if (isNaN(months)) return "N/A";
  if (months > 99) return "99+";
  return months.toFixed(1);
}

/**
 * Format burn rate for display - handles zero/stagnant
 */
function formatBurnRate(burn: number): string {
  if (burn === 0) return "Stagnant";
  if (burn < 0) return "Profitable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(burn);
}

// Extended interface for historical data
interface HistoricalData extends FinancialData {
  isHistorical?: boolean;
  historicalDate?: string;
}

const DNALab = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [data, setData] = useState<HistoricalData | null>(null);
  const [displayedRunway, setDisplayedRunway] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for historical data from DNA Archive rehydration
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
          
          // Clear the URL param without refreshing
          window.history.replaceState({}, "", "/");
          
          // Clear sessionStorage after loading
          sessionStorage.removeItem("runwayDNA_historical");
          
          toast({
            title: "Time Machine Active",
            description: `Viewing financial snapshot from ${historicalData.historicalDate}`,
          });
        } catch (e) {
          console.error("Failed to parse historical data:", e);
        }
      }
    }
  }, []);

  // Animate runway counter (handles Infinity for zero-burn scenarios)
  useEffect(() => {
    if (data && stage === "complete") {
      // Handle Infinity case - no animation needed
      if (!isFinite(data.runway_months)) {
        setDisplayedRunway(data.runway_months);
        return;
      }
      
      const target = data.runway_months;
      const duration = 1800;
      const steps = 80;
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
    await new Promise(r => setTimeout(r, 1400));

    setStage("mapping");
    await new Promise(r => setTimeout(r, 1200));

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
      
      // Sanitize data with edge case handling (zero burn, zero revenue, etc.)
      const sanitizedData = sanitizeFinancialData({
        runway_months: dnaData.runway_months,
        grade: dnaData.grade,
        monthly_burn: dnaData.monthly_burn,
        cash_on_hand: dnaData.cash_on_hand,
        profit_margin: dnaData.profit_margin,
        revenue_trend: dnaData.revenue_trend,
        expense_trend: dnaData.expense_trend,
        insight: dnaData.insight,
      });
      
      setData(sanitizedData);
    } catch {
      setData(DEMO_DATA);
      toast({
        title: "Demo Mode Activated",
        description: "Showing sample analysis for demonstration.",
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
        description: "Drop a CSV or Excel file.",
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
    setTimeout(() => setStage("mapping"), 1000);
    setTimeout(() => setStage("simulating"), 2000);
    setTimeout(() => {
      setData(DEMO_DATA);
      setStage("complete");
    }, 3000);
  };

  const resetAnalysis = () => {
    setStage("idle");
    setData(null);
    setDisplayedRunway(0);
  };

  const handleExportPNG = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      await exportAsPNG("health-card-export", `runway-dna-${data.grade}-${Date.now()}.png`);
      toast({
        title: "Exported Successfully",
        description: "Your Health Card has been downloaded as PNG.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export the Health Card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      await exportAsPDF("health-card-export", `runway-dna-${data.grade}-${Date.now()}.pdf`);
      toast({
        title: "Exported Successfully",
        description: "Your Health Card has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export the Health Card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (!data) return;
    shareToTwitter(data);
    toast({
      title: "Opening Twitter",
      description: "Share your financial DNA with the world!",
    });
  };

  const handleDownloadReport = () => {
    if (!data) return;
    
    // Generate scenarios based on current data
    const scenarios = {
      optimistic: { 
        runway: Math.min(data.runway_months * 1.5, 24), 
        description: "High revenue growth (50%), controlled expenses (0% growth)" 
      },
      current: { 
        runway: data.runway_months, 
        description: `Current trajectory based on ${data.grade} grade analysis` 
      },
      danger: { 
        runway: Math.max(data.runway_months * 0.6, 2), 
        description: "Rising costs (30% growth), stagnant revenue (0% growth)" 
      },
    };
    
    const report = generateInvestorUpdate(data, scenarios);
    downloadAsFile(report, `Runway-DNA-Report-${new Date().toISOString().split('T')[0]}.md`);
    
    toast({
      title: "Report Downloaded",
      description: "Your Investor DNA Report has been saved as Markdown.",
    });
  };

  const handleCopyInvestorUpdate = async () => {
    if (!data) return;
    
    const scenarios = {
      optimistic: { 
        runway: Math.min(data.runway_months * 1.5, 24), 
        description: "High revenue growth, controlled expenses" 
      },
      current: { 
        runway: data.runway_months, 
        description: "Current trajectory" 
      },
      danger: { 
        runway: Math.max(data.runway_months * 0.6, 2), 
        description: "Rising costs, stagnant revenue" 
      },
    };
    
    const report = generateInvestorUpdate(data, scenarios);
    const success = await copyToClipboard(report);
    
    if (success) {
      toast({
        title: "Investor Update Copied",
        description: "Ready for distribution. Paste into email or docs.",
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Please try again or download the report instead.",
        variant: "destructive",
      });
    }
  };

  const handleCopyForSlack = async () => {
    if (!data) return;
    
    const slackUpdate = generateSlackUpdate(data);
    const success = await copyToClipboard(slackUpdate);
    
    if (success) {
      toast({
        title: "Copied for Slack",
        description: "Emoji-rich update ready to paste!",
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyQuickStatus = async () => {
    if (!data) return;
    
    const quickStatus = generateQuickStatus(data);
    const success = await copyToClipboard(quickStatus);
    
    if (success) {
      toast({
        title: "Status Copied",
        description: "One-liner ready to share!",
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  const Sparkline = ({ data: chartData, color = "cobalt" }: { data: number[]; color?: string }) => {
    const max = Math.max(...chartData);
    const min = Math.min(...chartData);
    const range = max - min || 1;

    const points = chartData.map((value, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(" ");

    const gradientId = `spark-${color}-${Math.random()}`;
    const strokeColor = color === "cobalt" ? "hsl(226 100% 59%)" : "hsl(152 100% 50%)";
    const fillStart = color === "cobalt" ? "hsl(226 100% 59%)" : "hsl(152 100% 50%)";

    return (
      <svg className="w-full h-14" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillStart} stopOpacity="0.3" />
            <stop offset="100%" stopColor={fillStart} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill={`url(#${gradientId})`} />
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const getGradeClass = (grade: string) => {
    const g = grade.toLowerCase();
    if (g === "a") return "grade-a";
    if (g === "b") return "grade-b";
    if (g === "c") return "grade-c";
    return "grade-d";
  };

  return (
    <div className="min-h-screen w-full p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-cobalt mb-1">DNA Lab</h1>
          <p className="text-[hsl(220,10%,50%)] text-sm">
            Drop your financials. Get your startup's vital signs.
          </p>
        </div>
        {stage === "complete" && (
          <Button
            onClick={resetAnalysis}
            variant="outline"
            className="border-[hsl(226,100%,59%)/0.3] hover:border-[hsl(226,100%,59%)/0.6] hover:bg-[hsl(226,100%,59%)/0.1] text-[hsl(220,10%,70%)]"
          >
            <Zap className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        )}
      </motion.header>

      <AnimatePresence mode="wait">
        {/* IDLE STATE - The Magic Drop Zone */}
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto"
          >
            <div
              className={`drop-zone p-16 md:p-20 text-center cursor-pointer ${isDragging ? "drop-zone-active" : ""}`}
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

              <motion.div
                animate={{ 
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.05 : 1
                }}
                className="mb-8"
              >
                <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  isDragging 
                    ? "bg-[hsl(226,100%,59%)] shadow-xl shadow-[hsl(226,100%,59%)/0.4]" 
                    : "bg-[hsl(226,100%,59%)/0.15]"
                }`}>
                  <Upload className={`w-12 h-12 transition-colors ${
                    isDragging ? "text-white" : "text-[hsl(226,100%,59%)]"
                  }`} />
                </div>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gradient-cobalt">Drop Your Financial DNA</span>
              </h2>

              <p className="text-[hsl(220,10%,55%)] text-lg mb-10 max-w-md mx-auto">
                Bank exports, Stripe CSVs, or any spreadsheet with your numbers
              </p>

              <div className="flex items-center justify-center gap-6">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] text-white font-semibold px-8 hover:shadow-xl hover:shadow-[hsl(226,100%,59%)/0.3] transition-all"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </Button>
                <span className="text-[hsl(220,10%,40%)]">or</span>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleDemoMode(); }}
                  className="text-[hsl(152,100%,50%)] hover:text-[hsl(152,100%,60%)] hover:bg-[hsl(152,100%,50%)/0.1]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  See Demo
                </Button>
              </div>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex items-center justify-center gap-8 text-[hsl(220,10%,45%)] text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(152,100%,50%)]" />
                <span>256-bit encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(226,100%,59%)]" />
                <span>Data never stored</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(270,60%,50%)]" />
                <span>SOC 2 compliant</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* PROCESSING STATE - Cinematic Sequence */}
        {(stage === "decoding" || stage === "mapping" || stage === "simulating") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto text-center py-20"
          >
            <motion.div
              className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] flex items-center justify-center mb-10 glow-cobalt-intense"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Dna className="w-16 h-16 text-white animate-spin-slow" />
            </motion.div>

            <motion.h2
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gradient-cobalt mb-6"
            >
              {STAGE_MESSAGES[stage]}
            </motion.h2>

            {/* Progress dots */}
            <div className="flex justify-center gap-3">
              {["decoding", "mapping", "simulating"].map((s, i) => {
                const stages = ["decoding", "mapping", "simulating"];
                const currentIndex = stages.indexOf(stage);
                const isActive = i <= currentIndex;

                return (
                  <motion.div
                    key={s}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      isActive
                        ? "bg-[hsl(226,100%,59%)] shadow-lg shadow-[hsl(226,100%,59%)/0.5]"
                        : "bg-[hsl(220,10%,20%)]"
                    }`}
                    animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* COMPLETE STATE - Bento Dashboard */}
        {stage === "complete" && data && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            id="health-card-export"
            className="space-y-6"
          >
            {/* Historical Mode Banner */}
            {isHistoricalView && (data as HistoricalData).historicalDate && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-4 rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(270,60%,55%)/0.2] via-[hsl(240,15%,12%)] to-[hsl(180,80%,45%)/0.2]" />
                <div className="absolute inset-0 backdrop-blur-sm" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(270,60%,55%)/0.3] flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[hsl(270,60%,65%)]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[hsl(270,60%,65%)]" />
                        Time Machine Active
                      </h3>
                      <p className="text-[hsl(220,10%,55%)] text-sm">
                        Viewing historical snapshot from <span className="text-[hsl(270,60%,70%)] font-medium">{(data as HistoricalData).historicalDate}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setIsHistoricalView(false);
                      resetAnalysis();
                    }}
                    className="bg-[hsl(270,60%,55%)] hover:bg-[hsl(270,60%,60%)] text-white"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Exit Time Machine
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Bento Grid */}
            <div className="bento-grid">
            {/* THE PULSE - Runway Counter */}
            <motion.div
              className="bento-half glass-panel-intense p-8 flex flex-col justify-center items-center relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(226,100%,59%)/0.1] to-transparent" />
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[hsl(226,100%,68%)]" />
                  <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-[0.2em] font-medium">
                    Months of Life
                  </p>
                </div>
                <div className="runway-counter text-7xl md:text-8xl lg:text-9xl text-gradient-cobalt mb-4">
                  {!isFinite(data.runway_months) ? "∞" : displayedRunway.toFixed(1)}
                </div>
                <p className="text-[hsl(220,10%,50%)] font-medium">
                  Runway Remaining
                </p>
              </div>
            </motion.div>

            {/* HEALTH GRADE */}
            <motion.div
              className="bento-half glass-panel p-8 flex flex-col justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-[hsl(220,10%,55%)] text-sm uppercase tracking-[0.2em] font-medium mb-6">
                Health Grade
              </p>
              <div className={`grade-badge text-7xl md:text-8xl w-32 h-32 ${getGradeClass(data.grade)} ${data.grade.toUpperCase() === "A" ? "grade-halo" : ""}`}>
                {data.grade.toUpperCase()}
              </div>
              <p className="text-[hsl(220,10%,55%)] mt-6 text-center text-sm max-w-xs leading-relaxed">
                {data.insight}
              </p>
            </motion.div>

            {/* MONTHLY BURN */}
            <motion.div
              className="bento-third glass-panel p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[hsl(0,70%,50%)/0.15] flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-[hsl(0,70%,55%)]" />
                </div>
                <p className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider font-medium">
                  Monthly Burn
                </p>
              </div>
              <p className="text-3xl font-bold text-white mb-4">
                {data.monthly_burn === 0 ? (
                  <span className="text-[hsl(152,100%,50%)]">Stagnant</span>
                ) : (
                  formatCurrency(data.monthly_burn)
                )}
              </p>
              <div className="sparkline-container">
                <Sparkline data={data.expense_trend} color="cobalt" />
              </div>
            </motion.div>

            {/* CASH ON HAND */}
            <motion.div
              className="bento-third glass-panel p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[hsl(152,100%,50%)/0.15] flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-[hsl(152,100%,50%)]" />
                </div>
                <p className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider font-medium">
                  Cash on Hand
                </p>
              </div>
              <p className="text-3xl font-bold text-gradient-emerald mb-4">
                {formatCurrency(data.cash_on_hand)}
              </p>
              <div className="sparkline-container">
                <Sparkline data={data.revenue_trend} color="emerald" />
              </div>
            </motion.div>

            {/* PROFIT MARGIN */}
            <motion.div
              className="bento-third glass-panel p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[hsl(226,100%,59%)/0.15] flex items-center justify-center">
                  <Percent className="w-4 h-4 text-[hsl(226,100%,59%)]" />
                </div>
                <p className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider font-medium">
                  Profit Margin
                </p>
              </div>
              <p className="text-3xl font-bold text-white mb-4">
                {data.profit_margin.toFixed(1)}%
              </p>
              <div className="h-3 bg-[hsl(220,10%,12%)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(152,100%,50%)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(data.profit_margin * 2, 100)}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* SHARE ACTIONS */}
            <motion.div
              className="bento-hero glass-panel p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Founder Health Card</h3>
                    <p className="text-[hsl(220,10%,50%)] text-sm">Export your financial DNA as a shareable asset</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Download Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isExporting}
                        className="border-[hsl(226,100%,59%)/0.3] hover:border-[hsl(226,100%,59%)/0.6] hover:bg-[hsl(226,100%,59%)/0.1] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? "Exporting..." : "Download"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[hsl(270,15%,10%)] border-[hsl(226,100%,59%)/0.2]">
                      <DropdownMenuItem 
                        onClick={handleExportPNG}
                        className="text-white hover:bg-[hsl(226,100%,59%)/0.1] cursor-pointer"
                      >
                        <FileImage className="w-4 h-4 mr-2" />
                        Health Card (PNG)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleExportPDF}
                        className="text-white hover:bg-[hsl(226,100%,59%)/0.1] cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Health Card (PDF)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDownloadReport}
                        className="text-white hover:bg-[hsl(152,100%,50%)/0.1] cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2 text-[hsl(152,100%,50%)]" />
                        Investor Report (.md)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Share Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-[hsl(152,100%,50%)/0.3] hover:border-[hsl(152,100%,50%)/0.6] hover:bg-[hsl(152,100%,50%)/0.1] text-white"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[hsl(270,15%,10%)] border-[hsl(152,100%,50%)/0.2]">
                      <DropdownMenuItem 
                        onClick={handleCopyInvestorUpdate}
                        className="text-white hover:bg-[hsl(152,100%,50%)/0.1] cursor-pointer"
                      >
                        <ClipboardCheck className="w-4 h-4 mr-2 text-[hsl(152,100%,50%)]" />
                        Full Investor Update
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleCopyForSlack}
                        className="text-white hover:bg-[hsl(270,60%,55%)/0.1] cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 mr-2 text-[hsl(270,60%,55%)]" />
                        Copy for Slack
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleCopyQuickStatus}
                        className="text-white hover:bg-[hsl(45,90%,55%)/0.1] cursor-pointer"
                      >
                        <Zap className="w-4 h-4 mr-2 text-[hsl(45,90%,55%)]" />
                        Quick One-Liner
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    onClick={handleShare}
                    className="bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] text-white hover:shadow-lg hover:shadow-[hsl(226,100%,59%)/0.3]"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on X
                  </Button>
                </div>
              </div>

              {/* Quick Copy Bar */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(240,7%,8%)] border border-white/5">
                <div className="flex-1 font-mono text-sm text-[hsl(220,10%,60%)] truncate">
                  🧬 Runway DNA: Grade {data.grade.toUpperCase()} | {!isFinite(data.runway_months) ? "∞" : data.runway_months.toFixed(1)} Months Left | {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(data.cash_on_hand)} Cash
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyQuickStatus}
                  className="shrink-0 text-[hsl(226,100%,68%)] hover:text-white hover:bg-[hsl(226,100%,59%)/0.1]"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
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
