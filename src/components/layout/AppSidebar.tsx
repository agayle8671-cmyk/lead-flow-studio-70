import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dna, 
  FlaskConical, 
  Archive, 
  Wrench, 
  Settings, 
  Crown
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

// Navigation items with mode associations
const navigation = [
  {
    name: "DNA Lab",
    href: "/",
    icon: FlaskConical,
    color: "#0099FF", // Azure Radiance
    mode: "analysis" as const,
  },
  {
    name: "Archive",
    href: "/archive",
    icon: Archive,
    color: "#22C55E", // Success Green
    mode: "analysis" as const,
  },
  {
    name: "Toolkit",
    href: "/toolkit",
    icon: Wrench,
    color: "#F59E0B", // Warning Amber
    mode: "strategy" as const,
  },
  {
    name: "Scale Hub",
    href: "/settings",
    icon: Settings,
    color: "#A855F7", // Purple
    mode: "strategy" as const,
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();
  const [contextMode, setContextMode] = useState<'analysis' | 'strategy'>('analysis');
  const [activeIndicatorIndex, setActiveIndicatorIndex] = useState<number | null>(null);

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/");
    }
  };

  // Superlist spring physics - haptic feel
  const springTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  };

  const softSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
  };

  // Determine which items should be highlighted based on context mode
  const getItemVisibility = (itemMode: 'analysis' | 'strategy') => {
    return contextMode === itemMode;
  };

  // Find active nav item index and update indicator
  useEffect(() => {
    const activeNavIndex = navigation.findIndex(item => item.href === location.pathname);
    if (activeNavIndex !== -1) {
      setActiveIndicatorIndex(activeNavIndex);
    }
  }, [location.pathname]);
  
  const activeNavIndex = navigation.findIndex(item => item.href === location.pathname);

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-black border-r border-white/[0.06]">
      {/* ═══════════════════════════════════════════════════════════════════
          LOGO - Minimal
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="pt-10 px-8 pb-8">
        <motion.div 
          onClick={handleLogoClick}
          className="cursor-pointer"
          whileHover={{ opacity: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-[11px] font-medium tracking-[0.3em] text-white uppercase mb-1">
            Runway
          </h1>
          <h1 className="text-[11px] font-medium tracking-[0.3em] text-white/40 uppercase">
            DNA
          </h1>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTEXT SWITCHER - Physical toggle switch (Superlist Notebook style)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="px-6 mb-8">
        <div className="relative bg-white/[0.04] rounded-xl p-1 border border-white/[0.06] h-10">
          {/* Sliding background indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-white/[0.08] border border-white/[0.08]"
            initial={false}
            animate={{
              left: contextMode === 'analysis' ? '4px' : '50%',
              right: contextMode === 'analysis' ? '50%' : '4px',
            }}
            transition={springTransition}
          />
          
          <div className="relative flex h-full">
            {/* Analysis Mode */}
            <motion.button
              onClick={() => setContextMode('analysis')}
              className="flex-1 flex items-center justify-center z-10"
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
            >
              <motion.span 
                className="text-[11px] font-medium tracking-[0.1em] uppercase"
                animate={{ 
                  color: contextMode === 'analysis' ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                }}
                transition={{ duration: 0.2 }}
              >
                Analysis
              </motion.span>
            </motion.button>

            {/* Strategy Mode */}
            <motion.button
              onClick={() => setContextMode('strategy')}
              className="flex-1 flex items-center justify-center z-10"
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
            >
              <motion.span 
                className="text-[11px] font-medium tracking-[0.1em] uppercase"
                animate={{ 
                  color: contextMode === 'strategy' ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                }}
                transition={{ duration: 0.2 }}
              >
                Strategy
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          NAVIGATION - Monochrome icons with hover glow
      ═══════════════════════════════════════════════════════════════════ */}
      <nav className="flex-1 px-6 relative">
        {/* Haptic Active Indicator - slides smoothly between items */}
        <AnimatePresence mode="wait">
          {activeNavIndex !== -1 && (
            <motion.div
              key={activeNavIndex}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ 
                opacity: 1, 
                scaleY: 1,
                top: `${activeNavIndex * 50}px`, // Smooth position transition
              }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={springTransition}
              className="absolute left-6 w-[2px] bg-white origin-top"
              style={{
                height: '40px',
                boxShadow: `0 0 12px ${navigation[activeNavIndex]?.color || '#FFFFFF'}80`,
              }}
            />
          )}
        </AnimatePresence>

        <div className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            const isVisible = getItemVisibility(item.mode);
            const Icon = item.icon;


            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ 
                    opacity: isVisible ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ ...softSpring, delay: index * 0.05 }}
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                    ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                    ${!isVisible ? 'pointer-events-none' : ''}
                  `}
                >
                  {/* Icon - Monochrome with hover glow */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.15 }}
                    transition={softSpring}
                  >
                    <Icon 
                      className="w-5 h-5 transition-all duration-200"
                      style={{
                        color: isActive 
                          ? item.color 
                          : 'rgba(255,255,255,0.5)',
                        filter: isActive 
                          ? `drop-shadow(0 0 8px ${item.color}80)` 
                          : 'none',
                      }}
                    />
                    
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${item.color}30 0%, transparent 70%)`,
                      }}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Label */}
                  <motion.span 
                    className={`text-[13px] font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : isVisible
                          ? 'text-white/50 group-hover:text-white/70'
                          : 'text-white/20'
                    }`}
                  >
                    {item.name}
                  </motion.span>

                  {/* Context mode indicator dot */}
                  {isVisible && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.color}60`,
                      }}
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          PRO STATUS BADGE - Pill with pulse
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="px-6 pb-8">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08]"
          animate={{
            boxShadow: [
              "0 0 0px rgba(34, 197, 94, 0)",
              "0 0 12px rgba(34, 197, 94, 0.3)",
              "0 0 0px rgba(34, 197, 94, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Crown className="w-3.5 h-3.5 text-[#22C55E]" />
          </motion.div>
          <span className="text-[10px] font-semibold tracking-[0.15em] text-[#22C55E] uppercase">
            Pro
          </span>
        </motion.div>
      </div>
    </aside>
  );
};

export default AppSidebar;
