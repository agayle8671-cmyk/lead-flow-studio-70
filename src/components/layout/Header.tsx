import { motion } from "framer-motion";
import { Compass, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id) || document.querySelector(`section:nth-of-type(${id === 'features' ? '2' : id === 'pricing' ? '3' : '1'})`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
      <div className="container relative px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Compass className="w-4.5 h-4.5 text-primary-foreground" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">M.A.P.</span>
              <span className="text-[10px] text-muted-foreground tracking-wide">MARGIN AUDIT PRO</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Audit Tool', id: 'calculator' },
              { label: 'Features', id: 'features' },
              { label: 'Pricing', id: 'pricing' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => scrollToSection('calculator')}
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <Button
              onClick={() => scrollToSection('calculator')}
              size="sm"
              className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            >
              Start Audit
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-1">
            {['Audit Tool', 'Features', 'Pricing'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item === 'Audit Tool' ? 'calculator' : item.toLowerCase())}
                className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
