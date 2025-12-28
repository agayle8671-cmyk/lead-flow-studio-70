import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, FlaskConical, Archive, Wrench, Settings, Rocket, Zap, Plane } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

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

// Runway DNA Visualization - Airport runway with DNA-inspired elements
const RunwayDNA = () => {
  const [isHovered, setIsHovered] = useState(false);
  const runwayMarkers = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div 
      className="relative w-full h-56 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-1 left-1/2 -translate-x-1/2 z-20"
          >
            <div 
              className="px-3 py-2 rounded-lg backdrop-blur-xl border border-white/10"
              style={{
                background: "linear-gradient(135deg, hsl(226, 50%, 15%, 0.95) 0%, hsl(260, 40%, 12%, 0.95) 100%)",
                boxShadow: "0 8px 32px hsl(226, 100%, 30%, 0.3)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-[hsl(170,80%,50%)]"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ boxShadow: "0 0 6px hsl(170, 80%, 50%)" }}
                />
                <span className="text-[10px] font-medium text-[hsl(170,80%,60%)]">SCANNING</span>
              </div>
              <p className="text-[10px] font-medium text-white/90 mb-1.5">Mapping your runway...</p>
              <div className="w-32 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(226, 100%, 60%), hsl(170, 80%, 50%))" }}
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Perspective container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "300px" }}
      >
        {/* Runway surface with 3D perspective */}
        <motion.div
          className="relative"
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: "rotateX(55deg) translateY(20px)",
          }}
        >
          {/* Runway base */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
            style={{
              width: "70px",
              height: "200px",
              background: "linear-gradient(180deg, hsl(220, 20%, 8%) 0%, hsl(220, 25%, 12%) 50%, hsl(220, 20%, 8%) 100%)",
              borderRadius: "4px",
              boxShadow: "0 0 40px hsl(226, 100%, 30%, 0.2), inset 0 0 20px hsl(220, 20%, 5%)",
            }}
          >
            {/* Runway edge lights - left */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] flex flex-col justify-between py-2">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`left-${i}`}
                  className="w-[3px] h-[3px] rounded-full"
                  style={{
                    background: "hsl(45, 100%, 60%)",
                    boxShadow: "0 0 6px hsl(45, 100%, 50%), 0 0 12px hsl(45, 100%, 40%)",
                  }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            
            {/* Runway edge lights - right */}
            <div className="absolute right-0 top-0 bottom-0 w-[3px] flex flex-col justify-between py-2">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`right-${i}`}
                  className="w-[3px] h-[3px] rounded-full"
                  style={{
                    background: "hsl(45, 100%, 60%)",
                    boxShadow: "0 0 6px hsl(45, 100%, 50%), 0 0 12px hsl(45, 100%, 40%)",
                  }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Center line - DNA inspired dashes */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 flex flex-col justify-between">
              {runwayMarkers.map((i) => (
                <motion.div
                  key={i}
                  className="relative"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Main dash */}
                  <div 
                    className="w-[4px] h-[12px] rounded-full"
                    style={{
                      background: "linear-gradient(180deg, hsl(226, 100%, 70%), hsl(170, 80%, 55%))",
                      boxShadow: "0 0 8px hsl(226, 100%, 60%), 0 0 16px hsl(170, 80%, 50%, 0.5)",
                    }}
                  />
                  {/* DNA base pair wings */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 left-full ml-1 h-[2px] rounded-full"
                    style={{
                      width: "12px",
                      background: "linear-gradient(90deg, hsl(260, 80%, 60%), transparent)",
                      boxShadow: "0 0 4px hsl(260, 80%, 55%)",
                    }}
                    animate={{
                      width: ["8px", "14px", "8px"],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 right-full mr-1 h-[2px] rounded-full"
                    style={{
                      width: "12px",
                      background: "linear-gradient(-90deg, hsl(260, 80%, 60%), transparent)",
                      boxShadow: "0 0 4px hsl(260, 80%, 55%)",
                    }}
                    animate={{
                      width: ["8px", "14px", "8px"],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Threshold markers - bottom */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[6px] h-[2px] rounded-full"
                  style={{
                    background: "hsl(170, 80%, 55%)",
                    boxShadow: "0 0 4px hsl(170, 80%, 50%)",
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            {/* Data stream flying up the runway */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-[6px] h-[20px] rounded-full"
              style={{
                background: "linear-gradient(180deg, hsl(170, 100%, 60%), transparent)",
                boxShadow: "0 0 12px hsl(170, 100%, 55%), 0 0 24px hsl(170, 100%, 50%)",
              }}
              animate={{
                bottom: ["-10%", "110%"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Secondary data stream */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-[4px] h-[15px] rounded-full"
              style={{
                background: "linear-gradient(180deg, hsl(226, 100%, 65%), transparent)",
                boxShadow: "0 0 10px hsl(226, 100%, 60%)",
              }}
              animate={{
                bottom: ["-10%", "110%"],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 2.5,
                delay: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Takeoff Plane Animation */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        initial={{ bottom: "30%", scale: 0.6, opacity: 0 }}
        animate={{
          bottom: ["30%", "40%", "85%"],
          scale: [0.6, 0.9, 0.4],
          opacity: [0, 1, 1, 0],
          x: ["-50%", "-50%", "-30%"],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          repeatDelay: 4,
          ease: [0.2, 0.8, 0.4, 1],
          times: [0, 0.3, 1],
        }}
      >
        {/* Plane with glow effect */}
        <motion.div
          className="relative"
          animate={{
            rotate: [0, -5, -15],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 4,
            times: [0, 0.3, 1],
          }}
        >
          {/* Engine glow trail */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 rounded-full"
            style={{
              height: 20,
              background: "linear-gradient(180deg, hsl(35, 100%, 60%), hsl(25, 100%, 50%), transparent)",
              filter: "blur(2px)",
            }}
            animate={{
              height: [15, 30, 45],
              opacity: [0.5, 0.9, 0.7],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 4,
              times: [0, 0.3, 1],
            }}
          />
          {/* Plane icon */}
          <div
            className="relative"
            style={{
              filter: "drop-shadow(0 0 8px hsl(226, 100%, 60%)) drop-shadow(0 0 16px hsl(226, 100%, 50%))",
            }}
          >
            <Plane 
              className="w-6 h-6 text-white" 
              style={{ 
                transform: "rotate(-90deg)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }} 
              fill="hsl(226, 100%, 65%)"
              strokeWidth={1.5}
            />
          </div>
          {/* Wing contrails */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(200, 100%, 80%))",
            }}
            animate={{
              width: [0, 12, 20],
              opacity: [0, 0.6, 0.3],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 4,
              times: [0, 0.3, 1],
            }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-[1px]"
            style={{
              background: "linear-gradient(-90deg, transparent, hsl(200, 100%, 80%))",
            }}
            animate={{
              width: [0, 12, 20],
              opacity: [0, 0.6, 0.3],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 4,
              times: [0, 0.3, 1],
            }}
          />
        </motion.div>
      </motion.div>

      {/* Horizon glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 100% at 50% 0%, hsl(226, 100%, 50%, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Ambient DNA particles floating */}
      {[...Array(8)].map((_, i) => {
        const hue = [226, 260, 170][i % 3];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              left: `${15 + (i * 10)}%`,
              background: `hsl(${hue}, 100%, 65%)`,
              boxShadow: `0 0 6px hsl(${hue}, 100%, 60%)`,
            }}
            animate={{
              y: [180, 20],
              x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Bottom status bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-[hsl(170,80%,50%)]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ boxShadow: "0 0 4px hsl(170, 80%, 50%)" }}
        />
        <span className="text-[8px] uppercase tracking-widest text-[hsl(220,10%,50%)]">
          Runway Active
        </span>
      </div>
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
          <RunwayDNA />
          <p className="text-[10px] text-center text-[hsl(220,10%,45%)] mt-1 tracking-wider uppercase">
            Runway DNA
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
