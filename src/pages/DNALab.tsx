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
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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

const DNALab = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [data, setData] = useState<FinancialData | null>(null);
  const [displayedRunway, setDisplayedRunway] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animate runway counter
  useEffect(() => {
    if (data && stage === "complete") {
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

      const response = await fetch("https://marginauditpro.com/api/parse-finances", {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: "include",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();
      setData({
        runway_months: result.runwayMonths || 12,
        grade: (result.grade || "B").toUpperCase(),
        monthly_burn: result.monthlyBurn || 35000,
        cash_on_hand: result.cashOnHand || 420000,
        profit_margin: result.profitMargin || 15,
        revenue_trend: result.revenueTrend || [40, 45, 50, 55, 60, 65, 70],
        expense_trend: result.expenseTrend || [35, 38, 40, 42, 45, 48, 52],
        insight: result.insight || "Your financial DNA has been decoded."
      });
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
            className="bento-grid"
          >
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
                  {displayedRunway.toFixed(1)}
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
                {formatCurrency(data.monthly_burn)}
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
              className="bento-hero glass-panel p-6 flex items-center justify-between"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Founder Health Card</h3>
                  <p className="text-[hsl(220,10%,50%)] text-sm">Export your financial DNA as a shareable asset</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-[hsl(226,100%,59%)/0.3] hover:border-[hsl(226,100%,59%)/0.6] hover:bg-[hsl(226,100%,59%)/0.1] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button className="bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] text-white hover:shadow-lg hover:shadow-[hsl(226,100%,59%)/0.3]">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DNALab;
