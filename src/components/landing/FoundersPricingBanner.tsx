import { motion } from "framer-motion";
import { Rocket, Clock, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FoundersPricingBanner = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[150px]" />
      
      <div className="container relative px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Card */}
          <div className="relative rounded-3xl border border-primary/30 bg-card/80 backdrop-blur-xl p-8 md:p-12 overflow-hidden">
            {/* Decorative corner gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6"
            >
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Limited Time Offer</span>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left content */}
              <div className="relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold mb-4"
                >
                  Founder's Pricing
                  <span className="gradient-text block">50% Off Forever</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-muted-foreground mb-6"
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
                  className="space-y-3 mb-8"
                >
                  {[
                    "Unlimited profit analyses",
                    "Advanced AI recommendations",
                    "Priority customer support",
                    "Early access to new features",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </motion.ul>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button variant="hero" size="xl" className="group">
                    Claim Founder's Deal
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>

              {/* Right content - Pricing card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative"
              >
                <div className="rounded-2xl border border-border bg-background/50 p-8 text-center">
                  {/* Urgency counter */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Clock className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">127</span> spots remaining
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-2xl text-muted-foreground line-through">$49</span>
                      <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                        -50%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl md:text-6xl font-bold gradient-text">$24</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Billed annually • Cancel anytime
                    </p>
                  </div>

                  {/* Guarantee */}
                  <div className="pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      🔒 30-day money-back guarantee • No questions asked
                    </p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FoundersPricingBanner;
