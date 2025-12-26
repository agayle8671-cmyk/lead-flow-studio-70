import { Sparkles, Twitter, Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-border/30 py-16 md:py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative">
        <div className="grid md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">ProfitPulse</span>
            </a>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              AI-powered profit analysis that helps businesses understand and optimize their financial health.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Github, label: 'GitHub' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Mail, label: 'Email' },
              ].map(({ icon: Icon, label }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary/10 flex items-center justify-center transition-colors"
                  onClick={() => {}}
                >
                  <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider text-muted-foreground">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Calculator', action: scrollToCalculator },
                { label: 'Features', action: () => document.querySelector('section:nth-of-type(2)')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Pricing', action: () => document.querySelector('section:nth-of-type(3)')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'API (Coming Soon)', action: () => {} },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button 
                    onClick={action}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider text-muted-foreground">Company</h4>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => {}}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => {}}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 ProfitPulse. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-primary"
            >
              ♥
            </motion.span>
            <span className="text-sm text-muted-foreground">for growing businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
