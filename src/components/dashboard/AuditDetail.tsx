import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Loader2, TrendingUp, DollarSign, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client, useClient } from "@/contexts/ClientContext";
import MaestroHealthScore, { MaestroHealthScoreRef, HealthData } from "./MaestroHealthScore";
import ForecastChart from "./ForecastChart";
import { apiUrl } from "@/lib/config";

interface AuditDetailProps {
  client: Client;
  onBack: () => void;
}

interface AuditInsight {
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  actionItems: string[];
}

const AuditDetail = ({ client, onBack }: AuditDetailProps) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [insights, setInsights] = useState<AuditInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const healthScoreRef = useRef<MaestroHealthScoreRef>(null);
  const { setActiveClient } = useClient();

  useEffect(() => {
    setActiveClient(client);
    fetchInsights();
    return () => setActiveClient(null);
  }, [client, setActiveClient]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const response = await fetch(apiUrl(`/api/business-health?clientId=${client.id}`), {
        method: "GET",
        headers: { Accept: "application/json" },
        mode: "cors",
      });
      
      if (response.ok) {
        const data = await response.json();
        const generatedInsights: AuditInsight[] = [];
        
        if (data.insight) {
          generatedInsights.push({
            title: "Executive Summary",
            summary: data.insight,
            priority: data.grade === "F" ? "high" : data.grade === "C" ? "medium" : "low",
            actionItems: [
              "Review margin trends over the past quarter",
              "Compare against industry benchmarks",
              "Identify top 3 cost reduction opportunities"
            ]
          });
        }

        if (data.grade === "A" || data.grade === "B") {
          generatedInsights.push({
            title: "Growth Trajectory",
            summary: "Strong fundamentals support strategic expansion. Consider reinvesting profits into customer acquisition.",
            priority: "low",
            actionItems: [
              "Analyze customer lifetime value metrics",
              "Evaluate marketing channel ROI",
              "Plan for capacity scaling"
            ]
          });
        } else if (data.grade === "C" || data.grade === "F") {
          generatedInsights.push({
            title: "Remediation Required",
            summary: "Immediate attention required on operational efficiency. Focus on cost optimization.",
            priority: "high",
            actionItems: [
              "Conduct vendor contract renegotiations",
              "Review fixed vs variable cost structure",
              "Implement cash flow monitoring"
            ]
          });
        }

        setInsights(generatedInsights);
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-primary/10 text-primary border-primary/20";
      case "low": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{client.name}</h1>
                {client.grade && (
                  <span className={`badge-grade badge-grade-${client.grade.toLowerCase()}`}>
                    {client.grade}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{client.industry} • Client #{client.id}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => healthScoreRef.current?.refresh()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 space-y-6">
        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-4"
        >
          {[
            { icon: TrendingUp, label: "Performance", value: `${client.score || 0}%`, color: "text-primary" },
            { icon: Target, label: "Grade", value: client.grade || "—", color: "text-emerald-500" },
            { icon: DollarSign, label: "Status", value: "Active", color: "text-foreground" },
            { icon: Calendar, label: "Last Audit", value: client.lastAuditDate ? new Date(client.lastAuditDate).toLocaleDateString() : "—", color: "text-muted-foreground" },
          ].map((stat, i) => (
            <div key={stat.label} className="card-elevated rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Health Score */}
        <MaestroHealthScore ref={healthScoreRef} onHealthDataChange={setHealthData} clientId={client.id} />

        {/* Financial Trajectory Map */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Financial Trajectory Map</h2>
              <p className="text-sm text-muted-foreground">Historical performance with projected path overlay</p>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-[3px] rounded-full bg-emerald-500" />
                <span className="text-muted-foreground font-medium">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-[3px] rounded-full bg-blue-500" />
                <span className="text-muted-foreground font-medium">Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-[3px] rounded-full border-t-2 border-dashed border-muted-foreground" />
                <span className="text-muted-foreground font-medium">Projected</span>
              </div>
            </div>
          </div>
          <div className="h-[340px]">
            <ForecastChart clientId={client.id} />
          </div>
        </motion.div>

        {/* Audit Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated rounded-xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Audit Insights</h2>
            <p className="text-sm text-muted-foreground">AI-generated recommendations and action items</p>
          </div>

          {isLoadingInsights ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating insights...</p>
              </div>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Upload financial data to generate audit insights.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{insight.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityBadge(insight.priority)}`}>
                      {insight.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{insight.summary}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Items</p>
                    {insight.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AuditDetail;
