import { motion } from "framer-motion";
import { Rocket, Clock, Check, ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FoundersPricingBanner = () => {
  const { toast } = useToast();

  const handleClaimDeal = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
    toast({
      title: "Start your free analysis first!",
      description: "Complete your profit analysis to unlock Founder's pricing.",
    });
  };

  return (
    <section id="pricing" className="py-24 md:py-36 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, hsl(160 84% 45% / 0.15), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
      
      <div className="container relative px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {/* Card */}
          <div className="relative rounded-[2rem] border border-primary/20 bg-card/90 backdrop-blur-xl overflow-hidden">
            {/* Decorative gradient border */}
            <div className="absolute inset-0 rounded-[2rem] p-px bg-gradient-to-br from-primary/30 via-transparent to-primary/10 pointer-events-none" />
            
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="relative p-8 md:p-14">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 mb-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-4 h-4 text-primary fill-primary" />
                </motion.div>
                <span className="text-sm font-semibold text-primary">Limited Time Offer</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                  127 spots left
                </span>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left content */}
                <div className="relative z-10">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
                  >
                    Founder's Pricing
                    <motion.span 
                      className="gradient-text block mt-1"
                      animate={{ 
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      50% Off Forever
                    </motion.span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-muted-foreground text-lg mb-8 leading-relaxed"
                  >
                    Join our first 500 members and lock in exclusive lifetime pricing. 
                    Early supporters get premium features at startup-friendly rates.
                  </motion.p>

                  {/* Features */}
                  <motion.ul
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="space-y-4 mb-10"
                  >
                    {[
                      "Unlimited profit analyses",
                      "Advanced AI recommendations",
                      "Priority customer support",
                      "Early access to new features",
                    ].map((feature, i) => (
                      <motion.li 
                        key={feature} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <motion.div 
                          className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.2 }}
                        >
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </motion.div>
                        <span className="text-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Button 
                      variant="hero" 
                      size="xl" 
                      className="group shadow-2xl shadow-primary/30"
                      onClick={handleClaimDeal}
                    >
                      <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Claim Founder's Deal
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </div>

                {/* Right content - Pricing card */}
                <motion.div
                  initial={{ opacity: 0, x: 30, rotateY: -5 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative"
                >
                  <div className="rounded-2xl border border-border bg-background/80 backdrop-blur-sm p-8 text-center shadow-2xl">
                    {/* Popular badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>

                    {/* Urgency counter */}
                    <div className="flex items-center justify-center gap-2 mb-6 mt-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Clock className="w-4 h-4 text-primary" />
                      </motion.div>
                      <span className="text-sm text-muted-foreground">
                        Offer ends soon
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-3xl text-muted-foreground line-through opacity-50">$49</span>
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold">
                          SAVE 50%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl md:text-7xl font-bold gradient-text">$24</span>
                        <span className="text-muted-foreground text-lg">/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Billed annually • Cancel anytime
                      </p>
                    </div>

                    {/* CTA */}
                    <Button 
                      className="w-full mb-6" 
                      size="lg"
                      onClick={handleClaimDeal}
                    >
                      Get Started
                    </Button>

                    {/* Guarantee */}
                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-primary" />
                        30-day money-back guarantee
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FoundersPricingBanner;
