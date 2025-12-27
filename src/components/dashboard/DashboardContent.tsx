import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Save,
  Loader2,
  Sparkles,
  ShieldAlert,
  Rocket,
  Lightbulb
} from "lucide-react";
import MaestroHealthScore, { MaestroHealthScoreRef, HealthData } from "./MaestroHealthScore";
import RecommendationDrawer from "./RecommendationDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import type { CalculatorData } from "@/components/landing/ProfitCalculator";

interface DashboardContentProps {
  data: CalculatorData;
  userName: string;
  onSaveReport?: () => void;
  refreshHealthTrigger?: number;
}

interface Recommendation {
  status: "critical" | "warning" | "success" | "info";
  title: string;
  description: string;
  icon: React.ElementType;
}

const revenueData = [
  { month: "Jan", revenue: 38000, profit: 12000 },
  { month: "Feb", revenue: 42000, profit: 15000 },
  { month: "Mar", revenue: 39000, profit: 11000 },
  { month: "Apr", revenue: 48000, profit: 18000 },
  { month: "May", revenue: 52000, profit: 22000 },
  { month: "Jun", revenue: 50000, profit: 20000 },
];

const costBreakdown = [
  { name: "Operations", value: 35, color: "hsl(160, 84%, 45%)" },
  { name: "Marketing", value: 25, color: "hsl(200, 80%, 50%)" },
  { name: "Salaries", value: 30, color: "hsl(280, 60%, 50%)" },
  { name: "Other", value: 10, color: "hsl(40, 70%, 50%)" },
];

const generateRecommendations = (healthData: HealthData | null, profitMargin: number): Recommendation[] => {
  if (!healthData) {
    return [{
      status: "info",
      title: "Awaiting Data",
      description: "Upload a financial report to receive personalized AI recommendations.",
      icon: Lightbulb,
    }];
  }

  const { grade, score, insight } = healthData;
  const recommendations: Recommendation[] = [];

  // Primary recommendation based on the insight from backend
  if (insight) {
    const isUrgent = insight.toLowerCase().includes("urgent") || grade === "F";
    const isWarning = grade === "C" || insight.toLowerCase().includes("attention");
    
    recommendations.push({
      status: isUrgent ? "critical" : isWarning ? "warning" : "success",
      title: grade === "F" ? "Immediate Action Required" : grade === "C" ? "Areas Need Attention" : "Business Health Strong",
      description: insight,
      icon: isUrgent ? ShieldAlert : isWarning ? AlertCircle : Sparkles,
    });
  }

  // Grade-specific recommendations
  if (grade === "F") {
    recommendations.push({
      status: "critical",
      title: "Cost Reduction Critical",
      description: "Your expenses exceed revenue. Prioritize cutting non-essential costs and reviewing all vendor contracts immediately.",
      icon: AlertCircle,
    });
    if (score < 20) {
      recommendations.push({
        status: "critical",
        title: "Emergency Cash Flow Review",
        description: "With a score below 20%, consider emergency measures: pause marketing spend, negotiate payment terms, and explore bridge financing.",
        icon: ShieldAlert,
      });
    }
  } else if (grade === "C") {
    recommendations.push({
      status: "warning",
      title: "Optimize Marketing Efficiency",
      description: "Your marketing spend ratio needs adjustment. Focus on channels with proven ROI and reduce experimental spending.",
      icon: Target,
    });
    if (profitMargin < 15) {
      recommendations.push({
        status: "warning",
        title: "Margin Improvement Opportunity",
        description: "Consider price optimization and operational efficiencies to improve your profit margin above 15%.",
        icon: TrendingUp,
      });
    }
  } else if (grade === "B") {
    recommendations.push({
      status: "success",
      title: "Strong Foundation",
      description: "Your business fundamentals are solid. Focus on scaling what's working and maintaining operational discipline.",
      icon: CheckCircle,
    });
    recommendations.push({
      status: "info",
      title: "Growth Opportunity",
      description: "With your current health score, consider strategic investments in customer acquisition or product expansion.",
      icon: Rocket,
    });
  } else if (grade === "A") {
    recommendations.push({
      status: "success",
      title: "Excellent Performance",
      description: "Your business is operating at peak efficiency. Consider reinvesting profits into growth initiatives.",
      icon: Sparkles,
    });
    recommendations.push({
      status: "success",
      title: "Scale with Confidence",
      description: "Your metrics support aggressive expansion. Explore new markets or product lines while maintaining current efficiency.",
      icon: Rocket,
    });
  }

  return recommendations.slice(0, 3); // Max 3 recommendations
};

const DashboardContent = ({ data, userName, onSaveReport, refreshHealthTrigger }: DashboardContentProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const healthScoreRef = useRef<MaestroHealthScoreRef>(null);
  const profitMargin = ((data.revenue - data.costs) / data.revenue) * 100;
  const profit = data.revenue - data.costs;

  const handleRecommendationClick = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
    setIsDrawerOpen(true);
  };

  // Generate dynamic recommendations based on live health data
  const recommendations = useMemo(() => 
    generateRecommendations(healthData, profitMargin), 
    [healthData, profitMargin]
  );

  // Refresh health score when trigger changes
  useEffect(() => {
    if (refreshHealthTrigger && refreshHealthTrigger > 0) {
      healthScoreRef.current?.refresh();
    }
  }, [refreshHealthTrigger]);

  const handleSave = async () => {
    if (!onSaveReport) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveReport();
      setSaveSuccess(true);
      // Reset success state after animation
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const statsCards = [
    {
      title: "Monthly Revenue",
      value: `$${data.revenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Net Profit",
      value: `$${profit.toLocaleString()}`,
      change: `${profitMargin.toFixed(1)}%`,
      trend: profitMargin > 20 ? "up" : "down",
      icon: TrendingUp,
    },
    {
      title: "Active Customers",
      value: data.customers.toLocaleString(),
      change: "+8.3%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Avg Order Value",
      value: `$${data.avgOrderValue}`,
      change: "+5.2%",
      trend: "up",
      icon: Target,
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-6 md:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold">Welcome back, {userName.split(" ")[0]}</h1>
            <p className="text-muted-foreground">Here's your profit analysis overview</p>
          </motion.div>
          {onSaveReport && (
            <motion.div
              initial={false}
              animate={saveSuccess ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className={`gap-2 transition-all duration-300 ${
                  saveSuccess 
                    ? "bg-primary text-primary-foreground" 
                    : ""
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Report"}
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="p-6 md:p-8 space-y-6">
        {/* Maestro Health Score - Command Center */}
        <MaestroHealthScore ref={healthScoreRef} onHealthDataChange={setHealthData} />

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card variant="bento" className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-primary" : "text-destructive"
                  }`}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card variant="bento" className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center justify-between">
                  <span>Revenue vs Profit</span>
                  <span className="text-sm font-normal text-muted-foreground">Last 6 months</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          background: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(160, 84%, 45%)" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="hsl(200, 80%, 50%)" 
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cost Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card variant="bento" className="p-6 h-full">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {costBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                      <span className="text-xs font-medium ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card variant="bento" className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${
                      healthData?.grade === "F" ? "bg-destructive" : 
                      healthData?.grade === "C" ? "bg-yellow-500" : 
                      "bg-primary"
                    }`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  AI Recommendations
                  {healthData && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      healthData.grade === "F" ? "bg-destructive/10 text-destructive" :
                      healthData.grade === "C" ? "bg-yellow-500/10 text-yellow-600" :
                      healthData.grade === "B" ? "bg-primary/10 text-primary" :
                      "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      Grade {healthData.grade} · {healthData.score}%
                    </span>
                  )}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {healthData ? "Live" : "Awaiting data"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const IconComponent = rec.icon;
                  return (
                    <motion.div
                      key={`${rec.title}-${healthData?.score ?? 0}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                      onClick={() => handleRecommendationClick(rec)}
                      className={`flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer group ${
                        rec.status === "critical" 
                          ? "bg-destructive/5 hover:bg-destructive/10 border border-destructive/20" 
                          : rec.status === "warning"
                          ? "bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20"
                          : rec.status === "info"
                          ? "bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20"
                          : "bg-primary/5 hover:bg-primary/10 border border-primary/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        rec.status === "critical" 
                          ? "bg-destructive/10" 
                          : rec.status === "warning"
                          ? "bg-yellow-500/10"
                          : rec.status === "info"
                          ? "bg-blue-500/10"
                          : "bg-primary/10"
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          rec.status === "critical" ? "text-destructive" :
                          rec.status === "warning" ? "text-yellow-500" :
                          rec.status === "info" ? "text-blue-500" :
                          "text-primary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 transition-colors ${
                          rec.status === "critical" ? "text-destructive group-hover:text-destructive" :
                          rec.status === "warning" ? "text-yellow-600 dark:text-yellow-500 group-hover:text-yellow-600" :
                          "group-hover:text-primary"
                        }`}>{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      <ArrowUpRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                        rec.status === "critical" ? "text-destructive" :
                        rec.status === "warning" ? "text-yellow-500" :
                        "text-muted-foreground"
                      }`} />
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Recommendation Detail Drawer */}
      <RecommendationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        recommendation={selectedRecommendation}
        grade={healthData?.grade ?? "F"}
        score={healthData?.score ?? 0}
      />
    </div>
  );
};

export default DashboardContent;
