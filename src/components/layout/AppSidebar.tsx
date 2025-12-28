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

// 3D Rotating DNA Helix Component
const DNAHelix = () => {
  const numRungs = 12;
  const rungs = Array.from({ length: numRungs }, (_, i) => i);

  return (
    <div className="relative w-full h-52 overflow-hidden">
      {/* Radial glow background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(226, 100%, 59%, 0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* DNA Structure */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 120 200"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Enhanced gradients */}
            <linearGradient id="helixBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(226, 100%, 65%)" />
              <stop offset="50%" stopColor="hsl(226, 100%, 75%)" />
              <stop offset="100%" stopColor="hsl(226, 100%, 65%)" />
            </linearGradient>
            <linearGradient id="helixPurple" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(280, 80%, 60%)" />
              <stop offset="50%" stopColor="hsl(260, 80%, 70%)" />
              <stop offset="100%" stopColor="hsl(280, 80%, 60%)" />
            </linearGradient>
            <linearGradient id="helixCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(170, 80%, 45%)" />
              <stop offset="100%" stopColor="hsl(190, 80%, 55%)" />
            </linearGradient>
            <linearGradient id="rungGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(226, 100%, 59%)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="hsl(170, 80%, 50%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(280, 80%, 60%)" stopOpacity="0.8" />
            </linearGradient>
            
            {/* Glow filters */}
            <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="intenseGlow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="3" result="blur1" />
              <feGaussianBlur stdDeviation="6" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Animated DNA rungs with 3D sine wave effect */}
          {rungs.map((i) => {
            const yPos = 15 + i * 14;
            const phaseOffset = i * 0.5;
            
            return (
              <g key={i}>
                {/* Left node - oscillates with sine wave */}
                <motion.circle
                  cy={yPos}
                  r="5"
                  fill="url(#helixBlue)"
                  filter="url(#softGlow)"
                  animate={{
                    cx: [30 + Math.sin(phaseOffset) * 25, 90 - Math.sin(phaseOffset) * 25, 30 + Math.sin(phaseOffset) * 25],
                    r: [4, 6, 4],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Right node - opposite phase */}
                <motion.circle
                  cy={yPos}
                  r="5"
                  fill="url(#helixPurple)"
                  filter="url(#softGlow)"
                  animate={{
                    cx: [90 - Math.sin(phaseOffset) * 25, 30 + Math.sin(phaseOffset) * 25, 90 - Math.sin(phaseOffset) * 25],
                    r: [4, 6, 4],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Connecting rung with gradient */}
                <motion.line
                  y1={yPos}
                  y2={yPos}
                  stroke="url(#rungGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#softGlow)"
                  animate={{
                    x1: [30 + Math.sin(phaseOffset) * 25, 90 - Math.sin(phaseOffset) * 25, 30 + Math.sin(phaseOffset) * 25],
                    x2: [90 - Math.sin(phaseOffset) * 25, 30 + Math.sin(phaseOffset) * 25, 90 - Math.sin(phaseOffset) * 25],
                    strokeOpacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Energy pulse at center */}
                <motion.circle
                  cx="60"
                  cy={yPos}
                  fill="url(#helixCyan)"
                  filter="url(#intenseGlow)"
                  animate={{
                    r: [0, 3, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.15 + 0.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </g>
            );
          })}

          {/* Backbone strands - smooth curves */}
          <motion.path
            stroke="url(#helixBlue)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#softGlow)"
            animate={{
              d: [
                "M 55 15 Q 20 40, 55 70 Q 90 100, 55 130 Q 20 160, 55 183",
                "M 65 15 Q 100 40, 65 70 Q 30 100, 65 130 Q 100 160, 65 183",
                "M 55 15 Q 20 40, 55 70 Q 90 100, 55 130 Q 20 160, 55 183",
              ],
              strokeOpacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            stroke="url(#helixPurple)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#softGlow)"
            animate={{
              d: [
                "M 65 15 Q 100 40, 65 70 Q 30 100, 65 130 Q 100 160, 65 183",
                "M 55 15 Q 20 40, 55 70 Q 90 100, 55 130 Q 20 160, 55 183",
                "M 65 15 Q 100 40, 65 70 Q 30 100, 65 130 Q 100 160, 65 183",
              ],
              strokeOpacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Floating particles around the helix */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            left: `${25 + Math.random() * 50}%`,
            top: `${5 + Math.random() * 90}%`,
            background: i % 2 === 0 
              ? "hsl(226, 100%, 70%)" 
              : i % 3 === 0 
                ? "hsl(170, 80%, 55%)" 
                : "hsl(280, 80%, 65%)",
          }}
          animate={{
            y: [0, -15 - Math.random() * 20, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.9, 0],
            scale: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-4 right-4 h-[2px] rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(170, 80%, 50%) 50%, transparent 100%)",
          boxShadow: "0 0 10px hsl(170, 80%, 50%), 0 0 20px hsl(170, 80%, 50%)",
        }}
        animate={{
          top: ["5%", "95%", "5%"],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
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
          // Sync pulse with DNA animation (2.5s cycle, staggered by index)
          const pulseDelay = index * 0.3;

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
                <div className="relative">
                  {/* Pulsing glow ring - synced with DNA rhythm */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: isActive 
                        ? "hsl(226, 100%, 59%)" 
                        : "hsl(226, 100%, 65%)",
                    }}
                    animate={{
                      opacity: isActive ? [0.3, 0.6, 0.3] : [0, 0.15, 0],
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: pulseDelay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Outer glow pulse */}
                  <motion.div
                    className="absolute -inset-1 rounded-xl blur-md"
                    style={{
                      background: isActive 
                        ? "hsl(226, 100%, 59%)" 
                        : "hsl(260, 80%, 60%)",
                    }}
                    animate={{
                      opacity: isActive ? [0.2, 0.4, 0.2] : [0, 0.1, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: pulseDelay + 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? "bg-[hsl(226,100%,59%)]" 
                      : "bg-white/5"
                  }`}>
                    <motion.div
                      animate={{
                        filter: isActive 
                          ? ["drop-shadow(0 0 2px hsl(226, 100%, 80%))", "drop-shadow(0 0 6px hsl(226, 100%, 80%))", "drop-shadow(0 0 2px hsl(226, 100%, 80%))"]
                          : ["drop-shadow(0 0 0px transparent)", "drop-shadow(0 0 3px hsl(226, 100%, 70%))", "drop-shadow(0 0 0px transparent)"],
                      }}
                      transition={{
                        duration: 2.5,
                        delay: pulseDelay,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[hsl(220,10%,60%)]"}`} />
                    </motion.div>
                  </div>
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
