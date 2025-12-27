import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  Check, 
  Loader2, 
  ArrowLeft,
  Shield,
  BarChart3,
  Zap,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/contexts/PlanContext";
import { apiUrl } from "@/lib/config";

interface FirmLicensingProps {
  onBack: () => void;
}

const plans = [
  {
    id: "solo" as const,
    name: "Solo Auditor",
    price: 49,
    description: "For independent CPAs and small practices",
    endpoint: "/api/create-solo-session",
    features: [
      "Automated Audit Capacity: 10 clients",
      "Full M.A.P. diagnostic suite",
      "Real-time margin analytics",
      "Industry benchmark comparisons",
      "Standard email support",
    ],
    icon: Briefcase,
    popular: false,
  },
  {
    id: "firm" as const,
    name: "Firm Scale",
    price: 199,
    description: "For growing firms with expanding portfolios",
    endpoint: "/api/create-firm-session",
    features: [
      "Unlimited Portfolio Management",
      "Full M.A.P. diagnostic suite",
      "Advanced predictive forecasting",
      "Custom industry benchmarks",
      "Multi-user collaboration",
      "Priority support & onboarding",
      "API access for integrations",
    ],
    icon: Building2,
    popular: true,
  },
];

const FirmLicensing = ({ onBack }: FirmLicensingProps) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { plan: currentPlan, isFirm } = usePlan();

  const handleSelectPlan = async (planId: string, endpoint: string) => {
    if (planId === currentPlan) return;
    
    setLoadingPlan(planId);
    try {
      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border">
        <div className="px-8 py-5 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Firm Licensing</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Scale your audit practice with M.A.P.</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-5xl mx-auto">
        {/* Value Props */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: Zap, label: "Automated Audit Capacity", desc: "AI-powered analysis" },
            { icon: BarChart3, label: "Portfolio Management", desc: "Track all clients" },
            { icon: Shield, label: "Enterprise Security", desc: "SOC 2 compliant" },
          ].map((item, i) => (
            <div key={i} className="card-elevated rounded-xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative card-elevated rounded-2xl overflow-hidden ${
                plan.popular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 gradient-gold text-charcoal text-xs font-bold px-3 py-1 rounded-bl-lg">
                  RECOMMENDED
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    plan.popular 
                      ? "gradient-gold shadow-gold" 
                      : "bg-muted"
                  }`}>
                    <plan.icon className={`w-7 h-7 ${
                      plan.popular ? "text-charcoal" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? "gradient-gold text-charcoal font-semibold shadow-gold hover:shadow-lg" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  disabled={loadingPlan === plan.id || (plan.id === "firm" && isFirm)}
                  onClick={() => handleSelectPlan(plan.id, plan.endpoint)}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : plan.id === currentPlan ? (
                    "Current Plan"
                  ) : plan.id === "firm" ? (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Upgrade to Firm Scale
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <p className="text-sm text-muted-foreground">
            30-day money-back guarantee • Cancel anytime • Secure payment via Stripe
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default FirmLicensing;
