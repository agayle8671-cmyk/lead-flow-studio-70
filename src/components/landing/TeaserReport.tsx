import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Users, AlertTriangle, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalculatorData } from "./ProfitCalculator";

interface TeaserReportProps {
  data: CalculatorData;
  onUnlock: () => void;
}

const TeaserReport = ({ data, onUnlock }: TeaserReportProps) => {
  const profitMargin = ((data.revenue - data.costs) / data.revenue) * 100;
  const healthScore = Math.min(100, Math.max(0, profitMargin * 2 + 30 + (data.customers / 100)));

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-primary";
    if (score >= 40) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Analysis Complete</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Profit Health Score
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Based on your inputs, here's a preview of your business health.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card variant="glass" className="p-8 md:p-12 text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 553" }}
                    animate={{ strokeDasharray: `${(healthScore / 100) * 553} 553` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className={`text-5xl md:text-6xl font-bold ${getScoreColor(healthScore)}`}
                  >
                    {Math.round(healthScore)}
                  </motion.span>
                  <span className="text-sm text-muted-foreground mt-1">out of 100</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                {healthScore >= 70 ? "Strong Performance" : healthScore >= 40 ? "Room for Growth" : "Needs Attention"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {healthScore >= 70 
                  ? "Your business metrics look healthy, but there's always room to optimize."
                  : healthScore >= 40 
                  ? "You have solid foundations, but several areas could be improved."
                  : "There are critical areas that need immediate attention."}
              </p>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid sm:grid-cols-3 gap-4 mb-8"
          >
            <Card variant="bento" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Profit Margin</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(profitMargin * 2)}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </Card>

            <Card variant="bento" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Customer Value</span>
              </div>
              <p className="text-3xl font-bold">${data.avgOrderValue}</p>
            </Card>

            <Card variant="bento" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-sm text-muted-foreground">Issues Found</span>
              </div>
              <p className="text-3xl font-bold text-yellow-500">3</p>
            </Card>
          </motion.div>

          {/* Blurred Detailed Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative"
          >
            <Card variant="glass" className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  Full Detailed Report
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {/* Blurred content */}
                <div className="blur-[6px] select-none pointer-events-none">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Revenue Optimization</h4>
                      <div className="h-4 bg-secondary rounded w-full" />
                      <div className="h-4 bg-secondary rounded w-4/5" />
                      <div className="h-4 bg-secondary rounded w-3/5" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Cost Reduction</h4>
                      <div className="h-4 bg-secondary rounded w-full" />
                      <div className="h-4 bg-secondary rounded w-5/6" />
                      <div className="h-4 bg-secondary rounded w-2/3" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Top 5 Recommendations</h4>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20" />
                        <div className="flex-1 h-4 bg-secondary rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlay with unlock CTA */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-card via-card/80 to-transparent">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Unlock Your Full Report</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Get personalized recommendations, detailed charts, and actionable insights.
                    </p>
                    <Button variant="hero" size="lg" onClick={onUnlock} className="group">
                      Get Free Access
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeaserReport;
