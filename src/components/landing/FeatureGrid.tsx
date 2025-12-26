import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap, BarChart3, Target, Clock } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Revenue Optimization",
    description: "Identify hidden profit leaks and growth opportunities in your business.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Get actionable insights to protect and scale your margins.",
    color: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "AI-powered calculations deliver results in seconds, not hours.",
    color: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: BarChart3,
    title: "Smart Forecasting",
    description: "Predict future trends with machine learning-powered projections.",
    color: "from-purple-500/20 to-purple-500/5",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set profit targets and track progress with visual dashboards.",
    color: "from-rose-500/20 to-rose-500/5",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
  },
  {
    icon: Clock,
    title: "Time Savings",
    description: "Automate reports that used to take hours of manual work.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
  },
];

const FeatureGrid = () => {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }} />
      </div>

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <span className="text-sm font-medium text-muted-foreground">Powerful Features</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Why businesses trust{" "}
            <span className="gradient-text">ProfitPulse</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Join thousands of companies that have transformed their financial clarity with our AI-powered platform.
          </p>
        </motion.div>

        {/* Bento grid layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl`} />
              <div className="relative h-full p-8 rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 overflow-hidden">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <motion.div 
                  className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
