import { motion, AnimatePresence } from "framer-motion";
import { X, CheckSquare, Square, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ActionItem {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
}

interface RecommendationDetails {
  title: string;
  status: "critical" | "warning" | "success" | "info";
  description: string;
  explanation: string;
  actionItems: ActionItem[];
  resources?: { label: string; url: string }[];
}

interface RecommendationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: {
    title: string;
    status: "critical" | "warning" | "success" | "info";
    description: string;
  } | null;
  grade: string;
  score: number;
}

const getRecommendationDetails = (
  rec: { title: string; status: string; description: string },
  grade: string,
  score: number
): RecommendationDetails => {
  const baseDetails = {
    title: rec.title,
    status: rec.status as RecommendationDetails["status"],
    description: rec.description,
  };

  // Critical recommendations (F grade)
  if (rec.status === "critical") {
    if (rec.title.includes("Cost Reduction") || rec.title.includes("Immediate Action")) {
      return {
        ...baseDetails,
        explanation: `Your current score of ${score}% indicates severe financial stress. Revenue is not covering your total costs, leading to losses. Immediate intervention is required to prevent cash flow crisis.`,
        actionItems: [
          { id: "1", text: "Audit all recurring expenses and cancel non-essential subscriptions", priority: "high" },
          { id: "2", text: "Pause all marketing spend until profitability is restored", priority: "high" },
          { id: "3", text: "Negotiate payment terms with top 3 vendors", priority: "high" },
          { id: "4", text: "Review staffing levels and consider temporary freezes", priority: "medium" },
          { id: "5", text: "Identify and cut lowest-ROI products or services", priority: "medium" },
        ],
        resources: [
          { label: "Cash Flow Crisis Guide", url: "#" },
          { label: "Cost Cutting Strategies", url: "#" },
        ],
      };
    }
    if (rec.title.includes("Emergency") || rec.title.includes("Cash Flow")) {
      return {
        ...baseDetails,
        explanation: `With a score below 20%, your business is in emergency territory. Every day without action increases risk. Consider this a business emergency requiring immediate attention.`,
        actionItems: [
          { id: "1", text: "Calculate exact runway (days of cash remaining)", priority: "high" },
          { id: "2", text: "Contact bank about emergency credit line options", priority: "high" },
          { id: "3", text: "Reach out to top customers for prepayment opportunities", priority: "high" },
          { id: "4", text: "Halt all non-essential vendor payments", priority: "high" },
          { id: "5", text: "Explore invoice factoring or short-term financing", priority: "medium" },
        ],
        resources: [
          { label: "Emergency Financing Options", url: "#" },
          { label: "Business Turnaround Playbook", url: "#" },
        ],
      };
    }
  }

  // Warning recommendations (C grade)
  if (rec.status === "warning") {
    if (rec.title.includes("Marketing")) {
      return {
        ...baseDetails,
        explanation: `Your marketing spend is consuming too much of your revenue. The ideal marketing-to-revenue ratio is 5-15%. Focus on channels with proven conversion rates.`,
        actionItems: [
          { id: "1", text: "Calculate ROI for each marketing channel separately", priority: "high" },
          { id: "2", text: "Cut spend on channels with CAC > 3-month customer value", priority: "high" },
          { id: "3", text: "Double down on your top 2 performing channels", priority: "medium" },
          { id: "4", text: "Implement proper attribution tracking", priority: "medium" },
          { id: "5", text: "Test organic/content marketing to reduce paid dependency", priority: "low" },
        ],
        resources: [
          { label: "Marketing ROI Calculator", url: "#" },
          { label: "CAC Optimization Guide", url: "#" },
        ],
      };
    }
    if (rec.title.includes("Margin")) {
      return {
        ...baseDetails,
        explanation: `Profit margins below 15% leave little room for unexpected expenses or investments. Improving margins creates a buffer and enables sustainable growth.`,
        actionItems: [
          { id: "1", text: "Analyze pricing compared to competitors", priority: "high" },
          { id: "2", text: "Identify your highest-margin products/services", priority: "high" },
          { id: "3", text: "Renegotiate supplier contracts", priority: "medium" },
          { id: "4", text: "Reduce service delivery costs through automation", priority: "medium" },
          { id: "5", text: "Consider premium tiers or value-added services", priority: "low" },
        ],
        resources: [
          { label: "Pricing Strategy Guide", url: "#" },
          { label: "Margin Improvement Tactics", url: "#" },
        ],
      };
    }
  }

  // Success recommendations (A/B grades)
  if (rec.status === "success") {
    if (rec.title.includes("Excellent") || rec.title.includes("Strong")) {
      return {
        ...baseDetails,
        explanation: `Your ${score}% health score puts you in the top tier. Your business fundamentals are solid—now focus on protecting this position while exploring growth.`,
        actionItems: [
          { id: "1", text: "Build 6-month cash reserve if not already done", priority: "high" },
          { id: "2", text: "Document and systemize your winning processes", priority: "medium" },
          { id: "3", text: "Consider reinvesting 20-30% of profits into growth", priority: "medium" },
          { id: "4", text: "Explore adjacent market opportunities", priority: "low" },
          { id: "5", text: "Set up automated financial monitoring alerts", priority: "low" },
        ],
        resources: [
          { label: "Growth Investment Framework", url: "#" },
          { label: "Scaling Best Practices", url: "#" },
        ],
      };
    }
    if (rec.title.includes("Scale") || rec.title.includes("Growth")) {
      return {
        ...baseDetails,
        explanation: `Your metrics indicate you're ready for aggressive expansion. Your operational efficiency provides a stable base for scaling without compromising profitability.`,
        actionItems: [
          { id: "1", text: "Identify your most scalable revenue stream", priority: "high" },
          { id: "2", text: "Research new market segments or geographies", priority: "high" },
          { id: "3", text: "Plan hiring roadmap for next 6-12 months", priority: "medium" },
          { id: "4", text: "Evaluate technology investments for scale", priority: "medium" },
          { id: "5", text: "Consider strategic partnerships or acquisitions", priority: "low" },
        ],
        resources: [
          { label: "Scaling Playbook", url: "#" },
          { label: "Market Expansion Guide", url: "#" },
        ],
      };
    }
  }

  // Info/default
  return {
    ...baseDetails,
    explanation: "Upload a financial report to receive personalized recommendations based on your business metrics.",
    actionItems: [
      { id: "1", text: "Prepare your latest financial report", priority: "high" },
      { id: "2", text: "Include revenue, marketing spend, and operations costs", priority: "high" },
      { id: "3", text: "Upload using the file upload feature", priority: "medium" },
    ],
    resources: [
      { label: "Report Format Guide", url: "#" },
    ],
  };
};

const priorityColors = {
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20",
  low: "text-muted-foreground bg-secondary border-border",
};

const RecommendationDrawer = ({ isOpen, onClose, recommendation, grade, score }: RecommendationDrawerProps) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  if (!recommendation) return null;

  const details = getRecommendationDetails(recommendation, grade, score);

  const toggleItem = (id: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const statusColors = {
    critical: "from-destructive/20 to-destructive/5 border-destructive/30",
    warning: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    success: "from-primary/20 to-primary/5 border-primary/30",
    info: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className={`sticky top-0 bg-gradient-to-b ${statusColors[details.status]} p-6 border-b`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <span className={`text-xs font-medium uppercase tracking-wider ${
                    details.status === "critical" ? "text-destructive" :
                    details.status === "warning" ? "text-yellow-600" :
                    details.status === "success" ? "text-primary" :
                    "text-blue-500"
                  }`}>
                    {details.status === "critical" ? "Urgent Action Required" :
                     details.status === "warning" ? "Needs Attention" :
                     details.status === "success" ? "Opportunity" :
                     "Information"}
                  </span>
                  <h2 className="text-xl font-bold mt-1">{details.title}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Explanation */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Analysis
                </h3>
                <p className="text-foreground leading-relaxed">{details.explanation}</p>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  Action Items
                  <span className="text-xs font-normal">
                    ({completedItems.size}/{details.actionItems.length} done)
                  </span>
                </h3>
                <div className="space-y-3">
                  {details.actionItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                        completedItems.has(item.id)
                          ? "bg-primary/5 border-primary/20 opacity-60"
                          : "bg-secondary/50 border-border hover:bg-secondary"
                      }`}
                    >
                      {completedItems.has(item.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${completedItems.has(item.id) ? "line-through text-muted-foreground" : ""}`}>
                          {item.text}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${priorityColors[item.priority]}`}>
                        {item.priority}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Resources */}
              {details.resources && details.resources.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Resources
                  </h3>
                  <div className="space-y-2">
                    {details.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors group"
                      >
                        <span className="text-sm font-medium">{resource.label}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress indicator for critical items */}
              {details.status === "critical" && completedItems.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Progress Update</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You've completed {completedItems.size} of {details.actionItems.length} action items. 
                    Keep going to improve your business health!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RecommendationDrawer;