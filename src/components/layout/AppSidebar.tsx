import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Dna, FlaskConical, Archive, Wrench, Settings, Rocket, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const navigation = [
  {
    name: "DNA Lab",
    href: "/",
    icon: FlaskConical,
    description: "Analyze your runway",
  },
  {
    name: "DNA Archive",
    href: "/archive",
    icon: Archive,
    description: "Past analyses",
  },
  {
    name: "Founder Toolkit",
    href: "/toolkit",
    icon: Wrench,
    description: "Resources & tools",
  },
  {
    name: "Scale Hub",
    href: "/settings",
    icon: Settings,
    description: "Configure DNA",
  },
];

// Animated DNA Helix Component
const DNAHelix = () => {
  const numPairs = 8;
  const pairs = Array.from({ length: numPairs }, (_, i) => i);

  return (
    <div className="relative w-full h-40 overflow-hidden">
      {/* Glow backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(226,100%,59%)/0.05] to-transparent" />
      
      {/* DNA Strands Container */}
      <svg 
        viewBox="0 0 200 160" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Definitions for gradients and filters */}
        <defs>
          <linearGradient id="strandGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(226, 100%, 59%)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(260, 80%, 55%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(226, 100%, 59%)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="strandGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(260, 80%, 55%)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(170, 80%, 45%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(260, 80%, 55%)" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated DNA pairs */}
        {pairs.map((i) => {
          const yPos = 20 + i * 16;
          const delay = i * 0.15;
          
          return (
            <g key={i}>
              {/* Left strand node */}
              <motion.circle
                cx="60"
                cy={yPos}
                r="4"
                fill="url(#strandGradient1)"
                filter="url(#glow)"
                animate={{
                  cx: [60, 140, 60],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Right strand node */}
              <motion.circle
                cx="140"
                cy={yPos}
                r="4"
                fill="url(#strandGradient2)"
                filter="url(#glow)"
                animate={{
                  cx: [140, 60, 140],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Connecting base pair line */}
              <motion.line
                y1={yPos}
                y2={yPos}
                stroke="url(#strandGradient1)"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                filter="url(#glow)"
                animate={{
                  x1: [60, 140, 60],
                  x2: [140, 60, 140],
                }}
                transition={{
                  duration: 3,
                  delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Center glow pulse */}
              <motion.circle
                cx="100"
                cy={yPos}
                r="2"
                fill="hsl(170, 80%, 50%)"
                filter="url(#strongGlow)"
                animate={{
                  r: [1.5, 3, 1.5],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  delay: delay + 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}
        
        {/* Vertical backbone strands */}
        <motion.path
          d="M 60 20 Q 100 50, 60 80 Q 100 110, 60 140"
          stroke="url(#strandGradient1)"
          strokeWidth="2"
          fill="none"
          strokeOpacity="0.3"
          filter="url(#glow)"
          animate={{
            d: [
              "M 60 20 Q 100 50, 60 80 Q 100 110, 60 140",
              "M 140 20 Q 100 50, 140 80 Q 100 110, 140 140",
              "M 60 20 Q 100 50, 60 80 Q 100 110, 60 140",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M 140 20 Q 100 50, 140 80 Q 100 110, 140 140"
          stroke="url(#strandGradient2)"
          strokeWidth="2"
          fill="none"
          strokeOpacity="0.3"
          filter="url(#glow)"
          animate={{
            d: [
              "M 140 20 Q 100 50, 140 80 Q 100 110, 140 140",
              "M 60 20 Q 100 50, 60 80 Q 100 110, 60 140",
              "M 140 20 Q 100 50, 140 80 Q 100 110, 140 140",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
      
      {/* Ambient particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[hsl(226,100%,68%)]"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const AppSidebar = () => {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="glass-sidebar w-72 min-h-screen flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] flex items-center justify-center glow-cobalt">
            <Dna className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient-cobalt">Runway DNA</h1>
            <p className="text-xs text-[hsl(220,10%,50%)]">Founder Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <NavLink
                to={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  isActive 
                    ? "bg-[hsl(226,100%,59%)] shadow-lg shadow-[hsl(226,100%,59%)/0.3]" 
                    : "bg-white/5"
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[hsl(220,10%,60%)]"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-white" : ""}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-[hsl(220,10%,45%)] truncate">
                    {item.description}
                  </p>
                </div>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Animated DNA Helix Visualization */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-full"
        >
          <DNAHelix />
          <p className="text-[10px] text-center text-[hsl(220,10%,45%)] mt-2 tracking-wider">
            FINANCIAL DNA ANALYSIS
          </p>
        </motion.div>
      </div>

      {/* Pro Badge / CTA */}
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel-intense p-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(226,100%,59%)/0.1] to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-[hsl(226,100%,68%)]" />
              <span className="text-xs font-semibold text-[hsl(226,100%,68%)]">FOUNDER PRO</span>
            </div>
            <p className="text-xs text-[hsl(220,10%,60%)] mb-3">
              Unlock AI-powered forecasts & investor reports
            </p>
            <button 
              onClick={() => toast({
                title: "Founder Pro",
                description: "Pro features coming soon! We'll notify you when available.",
              })}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[hsl(226,100%,59%)/0.3] transition-all"
            >
              <Zap className="w-3 h-3" />
              Upgrade Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <p className="text-[10px] text-[hsl(220,10%,40%)] text-center">
          Built for founders who move fast
        </p>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
