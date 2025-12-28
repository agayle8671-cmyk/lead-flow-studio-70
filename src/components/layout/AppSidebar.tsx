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

// Premium 3D Rotating DNA Helix Component
const DNAHelix = () => {
  const numBasePairs = 16;
  const basePairs = Array.from({ length: numBasePairs }, (_, i) => i);

  return (
    <div className="relative w-full h-64 overflow-hidden">
      {/* Multi-layer ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(226, 100%, 50%, 0.2) 0%, hsl(260, 80%, 50%, 0.1) 40%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(170, 80%, 50%, 0.15) 0%, transparent 60%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* 3D DNA Helix using CSS transforms */}
      <div className="relative w-full h-full" style={{ perspective: "400px" }}>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: [0, 360] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {basePairs.map((i) => {
            const yOffset = -112 + i * 14;
            const rotationZ = i * 22.5; // Twist per base pair
            const hue1 = 226 + (i * 3) % 40;
            const hue2 = 260 + (i * 5) % 50;
            
            return (
              <motion.div
                key={i}
                className="absolute w-full flex items-center justify-center"
                style={{
                  transform: `translateY(${yOffset}px) rotateZ(${rotationZ}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Left nucleotide */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    background: `radial-gradient(circle at 30% 30%, hsl(${hue1}, 100%, 75%), hsl(${hue1}, 100%, 50%))`,
                    boxShadow: `0 0 12px hsl(${hue1}, 100%, 60%), 0 0 24px hsl(${hue1}, 100%, 50%, 0.5), inset 0 -2px 4px hsl(${hue1}, 100%, 30%)`,
                    transform: "translateX(-45px) translateZ(20px)",
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Right nucleotide */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    background: `radial-gradient(circle at 30% 30%, hsl(${hue2}, 80%, 75%), hsl(${hue2}, 80%, 50%))`,
                    boxShadow: `0 0 12px hsl(${hue2}, 80%, 60%), 0 0 24px hsl(${hue2}, 80%, 50%, 0.5), inset 0 -2px 4px hsl(${hue2}, 80%, 30%)`,
                    transform: "translateX(45px) translateZ(-20px)",
                  }}
                  animate={{
                    scale: [1.15, 1, 1.15],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Hydrogen bond (connecting bar) */}
                <motion.div
                  className="absolute h-[3px] rounded-full"
                  style={{
                    width: 78,
                    background: `linear-gradient(90deg, 
                      hsl(${hue1}, 100%, 60%) 0%, 
                      hsl(170, 80%, 55%) 35%,
                      hsl(170, 80%, 60%) 50%,
                      hsl(170, 80%, 55%) 65%,
                      hsl(${hue2}, 80%, 60%) 100%)`,
                    boxShadow: "0 0 8px hsl(170, 80%, 50%, 0.6)",
                    transform: "translateZ(0px)",
                  }}
                  animate={{
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.08,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Energy pulse traveling along bond */}
                <motion.div
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, hsl(170, 100%, 70%), hsl(170, 100%, 50%))",
                    boxShadow: "0 0 10px hsl(170, 100%, 60%), 0 0 20px hsl(170, 100%, 50%)",
                  }}
                  animate={{
                    x: [-39, 39, -39],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Backbone helix strands */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 120 256"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="backbone1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(226, 100%, 70%)" stopOpacity="0" />
            <stop offset="20%" stopColor="hsl(226, 100%, 65%)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(226, 100%, 60%)" stopOpacity="1" />
            <stop offset="80%" stopColor="hsl(226, 100%, 65%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(226, 100%, 70%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="backbone2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(280, 80%, 70%)" stopOpacity="0" />
            <stop offset="20%" stopColor="hsl(280, 80%, 65%)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(280, 80%, 60%)" stopOpacity="1" />
            <stop offset="80%" stopColor="hsl(280, 80%, 65%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(280, 80%, 70%)" stopOpacity="0" />
          </linearGradient>
          <filter id="backboneGlow" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated sine wave backbones */}
        <motion.path
          stroke="url(#backbone1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          filter="url(#backboneGlow)"
          animate={{
            d: [
              "M 25 20 Q 60 48, 25 76 Q 60 104, 25 132 Q 60 160, 25 188 Q 60 216, 25 244",
              "M 95 20 Q 60 48, 95 76 Q 60 104, 95 132 Q 60 160, 95 188 Q 60 216, 95 244",
              "M 25 20 Q 60 48, 25 76 Q 60 104, 25 132 Q 60 160, 25 188 Q 60 216, 25 244",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          stroke="url(#backbone2)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          filter="url(#backboneGlow)"
          animate={{
            d: [
              "M 95 20 Q 60 48, 95 76 Q 60 104, 95 132 Q 60 160, 95 188 Q 60 216, 95 244",
              "M 25 20 Q 60 48, 25 76 Q 60 104, 25 132 Q 60 160, 25 188 Q 60 216, 25 244",
              "M 95 20 Q 60 48, 95 76 Q 60 104, 95 132 Q 60 160, 95 188 Q 60 216, 95 244",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* Orbiting particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 60 + (i % 3) * 15;
        const size = 2 + Math.random() * 2;
        const hue = [226, 260, 170][i % 3];
        
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              background: `hsl(${hue}, 100%, 65%)`,
              boxShadow: `0 0 ${size * 2}px hsl(${hue}, 100%, 60%)`,
            }}
            animate={{
              x: [
                Math.cos(angle) * radius - size / 2,
                Math.cos(angle + Math.PI) * radius - size / 2,
                Math.cos(angle) * radius - size / 2,
              ],
              y: [
                Math.sin(angle) * radius * 0.5 - size / 2,
                Math.sin(angle + Math.PI) * radius * 0.5 - size / 2,
                Math.sin(angle) * radius * 0.5 - size / 2,
              ],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.2,
              delay: i * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Central core glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-32 rounded-full"
        style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(170, 80%, 50%, 0.3) 50%, transparent 100%)",
          filter: "blur(8px)",
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scaleX: [1, 1.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Data stream effect */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full"
        style={{
          height: 30,
          background: "linear-gradient(180deg, transparent 0%, hsl(170, 100%, 60%) 50%, transparent 100%)",
          boxShadow: "0 0 15px hsl(170, 100%, 55%), 0 0 30px hsl(170, 100%, 50%)",
        }}
        animate={{
          top: ["-10%", "110%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1,
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
