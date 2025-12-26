import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileSpreadsheet, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  DollarSign,
  PieChart,
  ArrowRight,
  Sparkles,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AppDemoProps {
  isVisible: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

const steps = [
  {
    id: 1,
    title: "Upload Your Data",
    description: "Drop your P&L or financial CSV",
    icon: Upload,
    color: "hsl(160 84% 45%)",
  },
  {
    id: 2,
    title: "AI Analyzes",
    description: "Smart algorithms scan every line",
    icon: Brain,
    color: "hsl(200 80% 50%)",
  },
  {
    id: 3,
    title: "Insights Revealed",
    description: "Hidden profit opportunities found",
    icon: TrendingUp,
    color: "hsl(280 70% 55%)",
  },
  {
    id: 4,
    title: "Take Action",
    description: "Clear recommendations to boost margins",
    icon: DollarSign,
    color: "hsl(45 90% 50%)",
  },
];

const mockData = {
  revenue: 487500,
  expenses: 342150,
  profit: 145350,
  margin: 29.8,
  opportunities: [
    { name: "Reduce SaaS subscriptions", savings: 4200 },
    { name: "Optimize contractor costs", savings: 8500 },
    { name: "Consolidate software tools", savings: 2800 },
  ],
};

const AppDemo = ({ isVisible, onClose, onGetStarted }: AppDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setShowResults(false);
      setAnimatedValue(0);
      return;
    }

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepTimer);
        setTimeout(() => setShowResults(true), 500);
        return prev;
      });
    }, 1200);

    return () => clearInterval(stepTimer);
  }, [isVisible]);

  useEffect(() => {
    if (showResults) {
      const duration = 1500;
      const target = mockData.opportunities.reduce((a, b) => a + b.savings, 0);
      const start = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedValue(Math.round(target * eased));
        
        if (progress < 1) requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    }
  }, [showResults]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full overflow-hidden"
        >
          <div className="relative py-16 md:py-24">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-20"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>

            <div className="container px-4 md:px-6">
              {/* Section header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">How It Works</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  From Upload to Insights in <span className="gradient-text">30 Seconds</span>
                </h2>
              </motion.div>

              {/* Demo container */}
              <div className="max-w-5xl mx-auto">
                {/* Progress steps */}
                <div className="relative mb-12">
                  <div className="flex justify-between items-center relative z-10">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStep;
                      const isCurrent = index === currentStep;
                      
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex flex-col items-center relative"
                        >
                          <motion.div
                            animate={{
                              scale: isCurrent ? [1, 1.15, 1] : 1,
                              boxShadow: isActive 
                                ? `0 0 30px ${step.color}40` 
                                : "none",
                            }}
                            transition={{ 
                              scale: { duration: 0.5, repeat: isCurrent ? Infinity : 0 },
                            }}
                            className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                              isActive 
                                ? "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50" 
                                : "bg-muted/50 border border-border/50"
                            }`}
                          >
                            <Icon 
                              className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-500 ${
                                isActive ? "text-primary" : "text-muted-foreground"
                              }`} 
                            />
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                              >
                                <CheckCircle className="w-3 h-3 text-primary-foreground" />
                              </motion.div>
                            )}
                          </motion.div>
                          <motion.div 
                            className="mt-3 text-center"
                            animate={{ opacity: isActive ? 1 : 0.4 }}
                          >
                            <p className={`text-xs md:text-sm font-medium transition-colors ${
                              isActive ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground hidden md:block mt-0.5">
                              {step.description}
                            </p>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Progress line */}
                  <div className="absolute top-7 md:top-8 left-[10%] right-[10%] h-0.5 bg-border/50 -z-0">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary/50"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Simulated app interface */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl"
                >
                  {/* Fake browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="max-w-md mx-auto px-4 py-1.5 rounded-lg bg-background/50 border border-border/50 text-xs text-muted-foreground text-center">
                        profitpulse.ai/dashboard
                      </div>
                    </div>
                  </div>

                  {/* App content area */}
                  <div className="p-6 md:p-8 min-h-[300px] md:min-h-[400px]">
                    <AnimatePresence mode="wait">
                      {!showResults ? (
                        <motion.div
                          key="processing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-full min-h-[280px]"
                        >
                          {/* File being analyzed animation */}
                          <motion.div
                            animate={{ 
                              rotateY: [0, 180, 360],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="relative w-20 h-20 mb-6"
                          >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30" />
                            <FileSpreadsheet className="absolute inset-0 m-auto w-10 h-10 text-primary" />
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                          >
                            <p className="text-lg font-medium mb-2">
                              {steps[currentStep]?.title || "Processing..."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {steps[currentStep]?.description}
                            </p>
                          </motion.div>

                          {/* Animated dots */}
                          <div className="flex gap-1 mt-6">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-primary"
                                animate={{ 
                                  scale: [1, 1.3, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="grid md:grid-cols-2 gap-6"
                        >
                          {/* Left side - metrics */}
                          <div className="space-y-4">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <PieChart className="w-5 h-5 text-primary" />
                                <span className="text-sm text-muted-foreground">Current Profit Margin</span>
                              </div>
                              <div className="text-4xl font-bold gradient-text">{mockData.margin}%</div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3">
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-4 rounded-xl bg-muted/50 border border-border/50"
                              >
                                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                                <p className="text-lg font-semibold">${(mockData.revenue / 1000).toFixed(0)}k</p>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-4 rounded-xl bg-muted/50 border border-border/50"
                              >
                                <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                                <p className="text-lg font-semibold">${(mockData.expenses / 1000).toFixed(0)}k</p>
                              </motion.div>
                            </div>
                          </div>

                          {/* Right side - opportunities */}
                          <div>
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20"
                            >
                              <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-foreground">Savings Found</span>
                              </div>
                              
                              <div className="text-5xl font-bold text-green-500 mb-4">
                                ${animatedValue.toLocaleString()}
                              </div>

                              <div className="space-y-2">
                                {mockData.opportunities.map((opp, i) => (
                                  <motion.div
                                    key={opp.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                                  >
                                    <span className="text-sm text-muted-foreground">{opp.name}</span>
                                    <span className="text-sm font-medium text-green-500">
                                      +${opp.savings.toLocaleString()}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* CTA after demo */}
                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-center mt-10"
                    >
                      <p className="text-muted-foreground mb-4">
                        Ready to discover your hidden profit?
                      </p>
                      <Button 
                        variant="hero" 
                        size="lg" 
                        onClick={onGetStarted}
                        className="group"
                      >
                        Try It Now — It's Free
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppDemo;
