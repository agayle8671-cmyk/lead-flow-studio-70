import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/config";

interface HealthData {
  grade: "A" | "B" | "C" | "F";
  score: number;
  insight: string;
}

export interface MaestroHealthScoreRef {
  refresh: () => void;
}

const gradeColors = {
  A: { ring: "hsl(142, 76%, 45%)", bg: "hsl(142, 76%, 45%)", text: "text-emerald-400" },
  B: { ring: "hsl(142, 60%, 50%)", bg: "hsl(142, 60%, 50%)", text: "text-emerald-500" },
  C: { ring: "hsl(45, 93%, 55%)", bg: "hsl(45, 93%, 55%)", text: "text-amber-400" },
  F: { ring: "hsl(0, 84%, 60%)", bg: "hsl(0, 84%, 60%)", text: "text-red-500" },
};

const MaestroHealthScore = forwardRef<MaestroHealthScoreRef>((_, ref) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = apiUrl("/api/business-health");
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch health data");
      }

      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      console.error("Error fetching health data:", err);
      setError("Unable to load health score");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchHealthData,
  }));

  useEffect(() => {
    fetchHealthData();
  }, []);

  const currentGrade = healthData?.grade ?? "F";
  const currentScore = healthData?.score ?? 0;
  const colors = gradeColors[currentGrade] || gradeColors.F;
  
  // Calculate the circumference and stroke dashoffset for the progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (currentScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-secondary/20">
        {/* Command Center Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Top Accent Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: colors.bg }}
        />

        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left: Health Score Ring */}
            <div className="relative flex-shrink-0">
              {loading ? (
                <div className="w-[180px] h-[180px] flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                </div>
              ) : error && !healthData ? (
                <div className="w-[180px] h-[180px] flex flex-col items-center justify-center text-center">
                  <span className="text-muted-foreground text-sm">Unable to load</span>
                  <Button variant="ghost" size="sm" onClick={fetchHealthData} className="mt-2">
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="relative w-[180px] h-[180px]">
                  {/* Background Ring */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="12"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={colors.ring}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: progressOffset }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      style={{
                        filter: `drop-shadow(0 0 12px ${colors.ring})`,
                      }}
                    />
                  </svg>
                  
                  {/* Grade Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      key={currentGrade}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                      className={`text-6xl font-black tracking-tight ${colors.text}`}
                      style={{
                        textShadow: `0 0 30px ${colors.bg}`,
                      }}
                    >
                      {currentGrade}
                    </motion.span>
                    <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase mt-1">
                      Health Score
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Maestro Insight */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold tracking-tight uppercase text-foreground/90">
                    Maestro Command Center
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchHealthData}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Score Badge */}
              {healthData && (
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                  <div 
                    className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide"
                    style={{ 
                      backgroundColor: `${colors.bg}20`,
                      color: colors.bg,
                      border: `1px solid ${colors.bg}40`,
                    }}
                  >
                    {currentScore}% Performance
                  </div>
                </div>
              )}

              {/* Insight Text */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full bg-primary/30 hidden lg:block" />
                <p className="text-muted-foreground leading-relaxed max-w-lg">
                  {loading ? (
                    <span className="inline-block animate-pulse">Analyzing your business health...</span>
                  ) : error && !healthData ? (
                    <span>Connect to your backend to view health insights.</span>
                  ) : (
                    healthData?.insight || "Your business metrics are being analyzed."
                  )}
                </p>
              </div>

              {/* Mini Stats Row */}
              {healthData && (
                <div className="flex items-center justify-center lg:justify-start gap-6 mt-6 pt-4 border-t border-border/50">
                  <div className="text-center lg:text-left">
                    <span className="text-2xl font-bold text-foreground">{currentScore}%</span>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center lg:text-left">
                    <span className={`text-2xl font-bold ${colors.text}`}>{currentGrade}</span>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Grade</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center lg:text-left">
                    <span className="text-2xl font-bold text-foreground">Live</span>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

MaestroHealthScore.displayName = "MaestroHealthScore";

export default MaestroHealthScore;
