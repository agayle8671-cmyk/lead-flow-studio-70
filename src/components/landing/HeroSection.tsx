import { motion } from "framer-motion";
import { ArrowRight, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const [showVideo, setShowVideo] = useState(false);

  const handleSeeHowItWorks = () => {
    // Scroll to feature grid section
    document.querySelector('section:nth-of-type(2)')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(160_84%_45%_/_0.15),transparent)]" />
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(160 84% 45% / 0.12) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(200 80% 50% / 0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Dot pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Diagonal accent lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute -top-1/2 -right-1/4 w-[120%] h-[200%] rotate-12 border-l border-primary/30" />
        <div className="absolute -top-1/2 -right-1/3 w-[120%] h-[200%] rotate-12 border-l border-primary/20" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8"
          >
            <motion.span 
              className="relative flex h-2 w-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </motion.span>
            <span className="text-sm font-medium text-foreground">
              AI-Powered Financial Intelligence
            </span>
            <Zap className="w-3.5 h-3.5 text-primary" />
          </motion.div>

          {/* Headline with staggered animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.95]"
          >
            <span className="block">Know your</span>
            <motion.span 
              className="gradient-text inline-block"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              true profit
            </motion.span>
            <span className="block text-muted-foreground/60 text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2">in 30 seconds</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Upload your financials. Get instant AI analysis. Discover opportunities to <span className="text-foreground font-medium">increase your margins by 15-30%</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onGetStarted}
              className="group w-full sm:w-auto relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Calculate My Profit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button 
              variant="glass" 
              size="xl"
              className="w-full sm:w-auto group"
              onClick={handleSeeHowItWorks}
            >
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              See How It Works
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: "2,500+", label: "Businesses Analyzed" },
              { value: "$12M+", label: "Profit Recovered" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating testimonial cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 flex flex-wrap justify-center gap-4"
          >
            {[
              { name: "Sarah K.", role: "E-commerce", quote: "Found $23k in hidden savings" },
              { name: "Mike R.", role: "SaaS", quote: "Reduced costs by 18%" },
              { name: "Lisa T.", role: "Agency", quote: "Profit margin up 25%" },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.15, type: "spring" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="px-5 py-3 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-lg"
              >
                <p className="text-sm font-medium text-foreground">"{testimonial.quote}"</p>
                <p className="text-xs text-muted-foreground mt-1">{testimonial.name} · {testimonial.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
