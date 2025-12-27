import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
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
        // Generate insights from health data
        const generatedInsights: AuditInsight[] = [];
        
        if (data.insight) {
          generatedInsights.push({
            title: "Primary Assessment",
            summary: data.insight,
            actionItems: [
              "Review margin trends over the past quarter",
              "Compare against industry benchmarks",
              "Identify top 3 cost reduction opportunities"
            ]
          });
        }

        if (data.grade === "A" || data.grade === "B") {
          generatedInsights.push({
            title: "Growth Opportunity",
            summary: "Strong fundamentals support strategic expansion. Consider reinvesting a portion of profits into customer acquisition.",
            actionItems: [
              "Analyze customer lifetime value metrics",
              "Evaluate marketing channel ROI",
              "Plan for capacity scaling"
            ]
          });
        } else if (data.grade === "C" || data.grade === "F") {
          generatedInsights.push({
            title: "Remediation Priority",
            summary: "Immediate attention required on operational efficiency. Focus on cost optimization before growth initiatives.",
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

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Portfolio
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">{client.name}</h1>
              <p className="text-sm text-muted-foreground">{client.industry} • Client ID: {client.id}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => healthScoreRef.current?.refresh()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 space-y-6">
        {/* Health Score */}
        <MaestroHealthScore ref={healthScoreRef} onHealthDataChange={setHealthData} clientId={client.id} />

        {/* Financial Trajectory Map */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Financial Trajectory Map</h2>
              <p className="text-sm text-muted-foreground">Historical performance with Projected Path overlay</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[hsl(160,84%,45%)]" />
                <span className="text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[hsl(200,80%,50%)]" />
                <span className="text-muted-foreground">Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-0.5 border-t-2 border-dashed border-muted-foreground" />
                <span className="text-muted-foreground">Projected Path</span>
              </div>
            </div>
          </div>
          <div className="h-[320px]">
            <ForecastChart clientId={client.id} />
          </div>
        </motion.div>

        {/* Audit Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Audit Insights</h2>
              <p className="text-sm text-muted-foreground">AI-generated executive summary and action items</p>
            </div>
          </div>

          {isLoadingInsights ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : insights.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Upload financial data to generate audit insights.
            </p>
          ) : (
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-2 border-primary pl-4"
                >
                  <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{insight.summary}</p>
                  <div className="space-y-1">
                    {insight.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
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
