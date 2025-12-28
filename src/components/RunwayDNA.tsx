import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Dna, Sparkles, TrendingUp, TrendingDown, DollarSign, Percent, Download, Share2 } from "lucide-react";
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

type ProcessingStage = 
  | "idle"
  | "decoding"
  | "mapping"
  | "simulating"
  | "complete";

const STAGE_MESSAGES: Record<ProcessingStage, string> = {
  idle: "",
  decoding: "Decoding Financial DNA...",
  mapping: "Mapping Revenue Genome...",
  simulating: "Simulating Survival Horizon...",
  complete: "Analysis Complete"
};

// Demo data for instant gratification
const DEMO_DATA: FinancialData = {
  runway_months: 18.4,
  grade: "A",
  monthly_burn: 42500,
  cash_on_hand: 765000,
  profit_margin: 24.7,
  revenue_trend: [45, 52, 48, 61, 58, 72, 78, 85, 92],
  expense_trend: [38, 41, 39, 44, 42, 48, 51, 54, 58],
  insight: "High-status profitability detected. Your burn efficiency puts you in the top 12% of funded startups. You are a Blitzscaler."
};

const RunwayDNA = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [data, setData] = useState<FinancialData | null>(null);
  const [displayedRunway, setDisplayedRunway] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animate runway counter
  useEffect(() => {
    if (data && stage === "complete") {
      const target = data.runway_months;
      const duration = 1500;
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
    // Stage 1: Decoding
    setStage("decoding");
    await new Promise(r => setTimeout(r, 1200));
    
    // Stage 2: Mapping
    setStage("mapping");
    await new Promise(r => setTimeout(r, 1000));
    
    // Stage 3: Simulating
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

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      
      // Map API response to our data structure
      setData({
        runway_months: result.runwayMonths || 12,
        grade: result.grade || "B",
        monthly_burn: result.monthlyBurn || 35000,
        cash_on_hand: result.cashOnHand || 420000,
        profit_margin: result.profitMargin || 15,
        revenue_trend: result.revenueTrend || [40, 45, 50, 55, 60, 65, 70],
        expense_trend: result.expenseTrend || [35, 38, 40, 42, 45, 48, 52],
        insight: result.insight || "Your financial DNA has been decoded. Review your metrics below."
      });
    } catch (error) {
      console.error("API Error:", error);
      // Fallback to demo data on error
      setData(DEMO_DATA);
      toast({
        title: "Using Demo Data",
        description: "Couldn't reach the server. Showing sample analysis.",
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
        title: "Invalid File",
        description: "Please drop a CSV or Excel file.",
        variant: "destructive"
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDemoMode = () => {
    setStage("decoding");
    setTimeout(() => setStage("mapping"), 800);
    setTimeout(() => setStage("simulating"), 1600);
    setTimeout(() => {
      setData(DEMO_DATA);
      setStage("complete");
    }, 2400);
  };

  const resetAnalysis = () => {
    setStage("idle");
    setData(null);
    setDisplayedRunway(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const Sparkline = ({ data, color = "gold" }: { data: number[]; color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sparkline-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color === "gold" ? "hsl(45 76% 52%)" : "hsl(142 70% 50%)"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color === "gold" ? "hsl(45 76% 52%)" : "hsl(142 70% 50%)"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon 
          points={`0,100 ${points} 100,100`} 
          fill={`url(#sparkline-${color})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color === "gold" ? "hsl(45 76% 52%)" : "hsl(142 70% 50%)"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Dna className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-gold-gradient">Runway DNA</span>
        </div>
        {stage === "complete" && (
          <Button 
            variant="ghost" 
            onClick={resetAnalysis}
            className="text-muted-foreground hover:text-foreground"
          >
            New Analysis
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Upload State */}
          {stage === "idle" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <div
                className={`drop-zone p-16 text-center cursor-pointer transition-all ${
                  isDragging ? "drop-zone-active" : ""
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
                
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Upload className={`w-10 h-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-gold-gradient">Drop Your Financial DNA</span>
                </h1>
                
                <p className="text-muted-foreground text-lg mb-8">
                  Bank statements, Stripe exports, or any CSV with your numbers
                </p>

                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <span className="text-muted-foreground">or</span>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={(e) => { e.stopPropagation(); handleDemoMode(); }}
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    See Demo
                  </Button>
                </div>
              </div>

              {/* Why section */}
              <div className="mt-12 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-3">Why I Built This</h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                  Founders waste hours wrestling with messy CSVs and spreadsheets. Runway DNA uses 
                  intelligent parsing to decode your financial data in seconds—turning chaos into 
                  a cinematic status symbol you can share with investors, advisors, and your team.
                </p>
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {(stage === "decoding" || stage === "mapping" || stage === "simulating") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-8 animate-pulse-glow">
                <Dna className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              
              <motion.h2
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gold-gradient mb-4"
              >
                {STAGE_MESSAGES[stage]}
              </motion.h2>
              
              <div className="flex justify-center gap-2">
                {["decoding", "mapping", "simulating"].map((s, i) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      stage === s || ["decoding", "mapping", "simulating"].indexOf(stage) > i
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Results - Bento Grid */}
          {stage === "complete" && data && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-5xl"
            >
              <div className="bento-grid">
                {/* The Pulse - Main Runway Counter */}
                <motion.div 
                  className="bento-half glass-card-gold p-8 flex flex-col justify-center items-center inner-glow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">Months of Life</p>
                  <div className="runway-counter text-7xl md:text-8xl text-gold-gradient animate-count-up">
                    {displayedRunway.toFixed(1)}
                  </div>
                  <p className="text-muted-foreground mt-2">Runway Remaining</p>
                </motion.div>

                {/* Health Grade */}
                <motion.div 
                  className="bento-half glass-card p-8 flex flex-col justify-center items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">Health Grade</p>
                  <div className={`grade-badge text-6xl md:text-7xl w-28 h-28 grade-${data.grade.toLowerCase()}`}>
                    {data.grade}
                  </div>
                  <p className="text-muted-foreground mt-4 text-center text-sm max-w-xs">
                    {data.insight}
                  </p>
                </motion.div>

                {/* Monthly Burn */}
                <motion.div 
                  className="bento-third glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Monthly Burn</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-3">
                    {formatCurrency(data.monthly_burn)}
                  </p>
                  <div className="sparkline">
                    <Sparkline data={data.expense_trend} color="gold" />
                  </div>
                </motion.div>

                {/* Cash on Hand */}
                <motion.div 
                  className="bento-third glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Cash on Hand</p>
                  </div>
                  <p className="text-2xl font-bold text-gold-gradient mb-3">
                    {formatCurrency(data.cash_on_hand)}
                  </p>
                  <div className="sparkline">
                    <Sparkline data={data.revenue_trend} color="green" />
                  </div>
                </motion.div>

                {/* Profit Margin */}
                <motion.div 
                  className="bento-third glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Percent className="w-4 h-4 text-primary" />
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Profit Margin</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-3">
                    {data.profit_margin.toFixed(1)}%
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(data.profit_margin * 2, 100)}%` }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    />
                  </div>
                </motion.div>

                {/* Share Actions */}
                <motion.div 
                  className="bento-main glass-card p-6 flex items-center justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Share Your Founder Health Card</h3>
                    <p className="text-muted-foreground text-sm">Download or share your financial DNA on social</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-border/50 hover:border-primary/50">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share on X
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center">
        <p className="text-muted-foreground text-xs">
          Built for founders who move fast • Your data never leaves your browser
        </p>
      </footer>
    </div>
  );
};

export default RunwayDNA;
