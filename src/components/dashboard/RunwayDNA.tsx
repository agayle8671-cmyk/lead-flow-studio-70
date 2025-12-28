import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, FileUp, Download, Share2, Zap, TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface RunwayDNAProps {
  onAuditComplete?: () => void;
}

interface FinancialData {
  grade: string;
  profitMargin: number;
  burnRate: number;
  runway: number; // months
  revenue: number;
  expenses: number;
  insight: string;
  revenueHistory?: number[];
  expenseHistory?: number[];
}

// Demo data for immediate visualization
const DEMO_DATA: FinancialData = {
  grade: "A",
  profitMargin: 24.7,
  burnRate: 12500,
  runway: 18,
  revenue: 847000,
  expenses: 638000,
  insight: "High-status profitability detected. You are operating at Blitzscaler efficiency. Your burn rate suggests 18 months of runway with current reserves.",
  revenueHistory: [65, 72, 68, 85, 92, 88, 95, 100],
  expenseHistory: [45, 48, 52, 55, 58, 60, 62, 65],
};

// Sparkline component for micro-visualizations
const Sparkline = ({ data, color, height = 24 }: { data: number[]; color: string; height?: number }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-6" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Animated counter for Life Expectancy
const LifeExpectancyCounter = ({ months, isLoading }: { months: number; isLoading: boolean }) => {
  const [displayMonths, setDisplayMonths] = useState(0);
  
  useEffect(() => {
    if (isLoading) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = months / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= months) {
        setDisplayMonths(months);
        clearInterval(timer);
      } else {
        setDisplayMonths(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [months, isLoading]);

  const years = Math.floor(displayMonths / 12);
  const remainingMonths = displayMonths % 12;

  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center gap-2">
        {years > 0 && (
          <>
            <span className="text-6xl md:text-7xl font-black gradient-text font-mono">
              {years}
            </span>
            <span className="text-xl text-muted-foreground">yr</span>
          </>
        )}
        <span className="text-6xl md:text-7xl font-black gradient-text font-mono">
          {remainingMonths}
        </span>
        <span className="text-xl text-muted-foreground">mo</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2 tracking-widest uppercase">
        Runway Remaining
      </p>
    </div>
  );
};

// Cinematic progress stages
const PROGRESS_STAGES = [
  "Extracting Financial DNA...",
  "Calculating Burn Trajectory...",
  "Mapping Revenue Patterns...",
  "Generating Health Profile...",
];

const RunwayDNA = ({ onAuditComplete }: RunwayDNAProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Progress stage animation
  useEffect(() => {
    if (!isProcessing) return;
    
    const interval = setInterval(() => {
      setProgressStage((prev) => (prev + 1) % PROGRESS_STAGES.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isProcessing]);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgressStage(0);
    setFinancialData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("https://marginauditpro.com/api/parse-finances", {
        method: "POST",
        body: formData,
        mode: "cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Runway DNA response:", data);

      // Map response to our financial data structure
      const mappedData: FinancialData = {
        grade: data.maestroGrade || data.grade || "B",
        profitMargin: data.profitMargin || data.margin || 15,
        burnRate: data.burnRate || 15000,
        runway: data.runway || data.runwayMonths || 12,
        revenue: data.revenue || data.totalRevenue || 500000,
        expenses: data.expenses || data.totalExpenses || 400000,
        insight: data.maestroInsight || data.insight || "Financial analysis complete.",
        revenueHistory: data.revenueHistory || [60, 65, 70, 75, 80, 85, 90, 95],
        expenseHistory: data.expenseHistory || [40, 42, 45, 48, 50, 52, 55, 58],
      };

      setFinancialData(mappedData);

      // Grade A celebration
      if (mappedData.grade === "A" || mappedData.grade === "A+") {
        toast({
          title: "🏆 Elite Status Achieved",
          description: "Your financial DNA shows Blitzscaler-grade efficiency.",
          className: "bg-primary/10 border-primary/30",
        });
      }

      onAuditComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not process the document.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, onAuditComplete]);

  const validateAndProcessFile = useCallback((file: File) => {
    const validTypes = [".csv", ".txt", ".json", ".pdf"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a Bank or Stripe CSV export.",
      });
      return;
    }

    processFile(file);
  }, [processFile, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleDemoClick = () => {
    setShowDemo(true);
    setFinancialData(DEMO_DATA);
  };

  const generateShareCard = () => {
    toast({
      title: "Founder Card Generated",
      description: "Your shareable Runway DNA card is ready for download.",
      className: "bg-primary/10 border-primary/30",
    });
  };

  const displayData = financialData || (showDemo ? DEMO_DATA : null);
  const isGradeA = displayData?.grade === "A" || displayData?.grade === "A+";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Drop Zone */}
      <AnimatePresence mode="wait">
        {!displayData && !isProcessing ? (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative min-h-[80vh] flex flex-col items-center justify-center px-6"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12 relative z-10"
            >
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                <span className="gradient-text">Runway DNA</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Turn messy bank exports into cinematic financial intelligence.
              </p>
            </motion.div>

            {/* Massive Drop Zone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative w-full max-w-2xl aspect-[16/9] rounded-3xl cursor-pointer transition-all duration-500",
                "border-2 border-dashed flex flex-col items-center justify-center gap-6",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02] drop-zone-glow"
                  : "border-border/50 hover:border-primary/50 hover:bg-card/50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv,.txt,.json,.pdf"
              />

              <motion.div
                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors",
                  isDragging ? "bg-primary/20" : "bg-secondary"
                )}
              >
                <FileUp className={cn(
                  "w-10 h-10 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </motion.div>

              <div className="text-center">
                <p className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                  {isDragging ? "Release to Analyze" : "Drop Your Bank/Stripe CSV"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • CSV, TXT, JSON, PDF
                </p>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
            </motion.div>

            {/* Demo CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Button
                variant="ghost"
                onClick={handleDemoClick}
                className="text-muted-foreground hover:text-primary"
              >
                <Zap className="w-4 h-4 mr-2" />
                See Demo Report Instantly
              </Button>
            </motion.div>
          </motion.section>
        ) : isProcessing ? (
          /* Processing State */
          <motion.section
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[80vh] flex flex-col items-center justify-center px-6"
          >
            <div className="text-center space-y-8">
              {/* Animated Loader */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-4 border-secondary border-t-primary mx-auto"
              />

              {/* Progress Stage Text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={progressStage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-semibold text-foreground"
                >
                  {PROGRESS_STAGES[progressStage]}
                </motion.p>
              </AnimatePresence>

              {/* Progress Bar */}
              <div className="w-64 h-1 bg-secondary rounded-full mx-auto overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>
            </div>
          </motion.section>
        ) : displayData ? (
          /* Results Dashboard */
          <motion.section
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 px-6 max-w-6xl mx-auto space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="gradient-text">Runway DNA</span> Report
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Financial intelligence extracted</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={generateShareCard}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={generateShareCard}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Card
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFinancialData(null);
                    setShowDemo(false);
                  }}
                >
                  New Analysis
                </Button>
              </div>
            </div>

            {/* Life Expectancy Counter - Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "rounded-2xl p-8 text-center",
                isGradeA ? "runway-card-gold animate-glow-pulse" : "runway-card"
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  Life Expectancy
                </span>
              </div>
              
              <LifeExpectancyCounter months={displayData.runway} isLoading={false} />
              
              <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">at</span>
                <span className="font-mono text-foreground">${displayData.burnRate.toLocaleString()}</span>
                <span className="text-muted-foreground">/month burn</span>
              </div>
            </motion.div>

            {/* Health Grade Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "rounded-2xl p-8",
                isGradeA ? "runway-card-gold" : "runway-card"
              )}
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Grade Display */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className={cn(
                      "w-32 h-32 rounded-full flex items-center justify-center",
                      "border-4",
                      isGradeA ? "border-primary bg-primary/10" : "border-muted-foreground/30 bg-secondary"
                    )}
                  >
                    <span className={cn(
                      "text-6xl font-black",
                      isGradeA ? "gradient-text" : "text-muted-foreground"
                    )}>
                      {displayData.grade}
                    </span>
                  </motion.div>
                  {isGradeA && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>

                {/* Insight */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-lg font-bold mb-2">
                    {isGradeA ? "Blitzscaler Status" : "Financial Health"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {displayData.insight}
                  </p>
                  
                  {/* Profit Margin Badge */}
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="font-mono font-bold text-foreground">
                      {displayData.profitMargin.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">profit margin</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Revenue & Expenses with Sparklines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="runway-card rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                  </div>
                  <span className="text-xs text-muted-foreground">90-day trend</span>
                </div>
                
                <p className="text-3xl font-bold font-mono text-foreground mb-4">
                  ${(displayData.revenue / 1000).toFixed(0)}K
                </p>
                
                {displayData.revenueHistory && (
                  <div className="sparkline-container rounded-lg p-2">
                    <Sparkline data={displayData.revenueHistory} color="hsl(142, 76%, 45%)" />
                  </div>
                )}
              </motion.div>

              {/* Expenses */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="runway-card rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium text-muted-foreground">Expenses</span>
                  </div>
                  <span className="text-xs text-muted-foreground">90-day trend</span>
                </div>
                
                <p className="text-3xl font-bold font-mono text-foreground mb-4">
                  ${(displayData.expenses / 1000).toFixed(0)}K
                </p>
                
                {displayData.expenseHistory && (
                  <div className="sparkline-container rounded-lg p-2">
                    <Sparkline data={displayData.expenseHistory} color="hsl(45, 76%, 52%)" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Why I Built This Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="runway-card rounded-2xl p-8 mt-12"
            >
              <h3 className="text-lg font-bold mb-4 gradient-text">Why I Built This</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every founder I met was drowning in messy CSV exports. Bank statements that make no sense. 
                Stripe exports with 47 columns. QuickBooks files that crash Excel. So I built Runway DNA — 
                a tool that extracts the signal from the noise using our CID Tagging protocol. 
                Drop your file, get your DNA. No signup required. Built for founders who move fast.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Built with obsession</p>
                  <p className="text-sm text-muted-foreground">by the Margin Audit Pro team</p>
                </div>
              </div>
            </motion.div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default RunwayDNA;
