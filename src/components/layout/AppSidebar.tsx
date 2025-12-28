import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dna, 
  FlaskConical, 
  Archive, 
  Wrench, 
  Settings, 
  Crown, 
  Sparkles,
  BarChart3,
  Zap
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

// Navigation with monochrome icons that reveal brand color on hover
const navigation = [
  {
    name: "DNA Lab",
    href: "/",
    icon: FlaskConical,
    color: "#0099FF", // Azure Radiance
    description: "Analyze"
  },
  {
    name: "Archive",
    href: "/archive",
    icon: Archive,
    color: "#22C55E", // Success Green
    description: "History"
  },
  {
    name: "Toolkit",
    href: "/toolkit",
    icon: Wrench,
    color: "#F59E0B", // Warning Amber
    description: "Tools"
  },
  {
    name: "Scale Hub",
    href: "/settings",
    icon: Settings,
    color: "#A855F7", // Purple
    description: "Settings"
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();
  const [mode, setMode] = useState<'analysis' | 'simulation'>('analysis');

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/");
    }
  };

  // Superlist spring physics
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

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-black border-r border-white/[0.05]">
      {/* ═══════════════════════════════════════════════════════════════════
          LOGO - Minimal Azure Mark
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="p-5 border-b border-white/[0.05]">
        <motion.div 
          onClick={handleHomeClick}
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
        >
          <motion.div 
            className="w-9 h-9 rounded-lg bg-[#0099FF] flex items-center justify-center"
            whileHover={{ 
              boxShadow: "0 0 20px rgba(0, 153, 255, 0.5)",
            }}
            transition={softSpring}
          >
            <Dna className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Runway DNA</h1>
            <p className="text-[10px] text-white/40 tracking-wide">FOUNDER INTELLIGENCE</p>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTEXT TOGGLE - Superlist "Work/Personal" Style
          Physical, haptic, with sliding indicator
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="px-3 py-4">
        <div className="relative bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
          {/* Sliding Background Indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-white/[0.08] border border-white/[0.08]"
            initial={false}
            animate={{
              left: mode === 'analysis' ? '4px' : '50%',
              right: mode === 'analysis' ? '50%' : '4px',
            }}
            transition={springTransition}
            style={{
              boxShadow: mode === 'analysis' 
                ? '0 0 12px rgba(0, 153, 255, 0.2)' 
                : '0 0 12px rgba(220, 38, 38, 0.2)'
            }}
          />
          
          <div className="relative flex">
            {/* Analysis Mode */}
            <motion.button
              onClick={() => setMode('analysis')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg z-10"
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
            >
              <motion.div
                animate={{ 
                  color: mode === 'analysis' ? '#0099FF' : 'rgba(255,255,255,0.4)',
                }}
                transition={{ duration: 0.2 }}
              >
                <BarChart3 className="w-4 h-4" />
              </motion.div>
              <motion.span 
                className="text-xs font-semibold"
                animate={{ 
                  color: mode === 'analysis' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                }}
                transition={{ duration: 0.2 }}
              >
                Analysis
              </motion.span>
            </motion.button>

            {/* Simulation Mode */}
            <motion.button
              onClick={() => setMode('simulation')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg z-10"
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
            >
              <motion.div
                animate={{ 
                  color: mode === 'simulation' ? '#DC2626' : 'rgba(255,255,255,0.4)',
                }}
                transition={{ duration: 0.2 }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
              <motion.span 
                className="text-xs font-semibold"
                animate={{ 
                  color: mode === 'simulation' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                }}
                transition={{ duration: 0.2 }}
              >
                Simulate
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* Mode Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] text-white/30 text-center mt-2 tracking-wide"
          >
            {mode === 'analysis' ? 'REAL DATA MODE' : 'SCENARIO PLANNING'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          NAVIGATION - Monochrome icons, brand color on hover/active
      ═══════════════════════════════════════════════════════════════════ */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...softSpring, delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group
                  ${isActive 
                    ? 'bg-white/[0.06]' 
                    : 'hover:bg-white/[0.03]'
                  }`}
              >
                {/* Active Indicator Line */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={springTransition}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                      style={{ 
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.color}50`
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon Container */}
                <motion.div
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200"
                  animate={{
                    backgroundColor: isActive ? `${item.color}15` : 'transparent',
                  }}
                >
                  <Icon 
                    className="w-4 h-4 transition-colors duration-200"
                    style={{
                      color: isActive ? item.color : 'rgba(255,255,255,0.35)',
                    }}
                  />
                </motion.div>

                {/* Label */}
                <span className={`text-[13px] font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/45 group-hover:text-white/70'
                }`}>
                  {item.name}
                </span>

                {/* Hover Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 20% 50%, ${item.color}08 0%, transparent 50%)`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          PRO UPGRADE CARD
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="p-3">
        <motion.div 
          className="glass-card p-4 overflow-hidden relative"
          whileHover={{ scale: 1.01 }}
          transition={softSpring}
        >
          {/* Background Gradient Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0099FF] rounded-full opacity-10 blur-3xl" />
          
          {user.isPro ? (
            <div className="relative flex items-center gap-3">
              <motion.div 
                className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    "0 0 15px rgba(251, 191, 36, 0.3)",
                    "0 0 25px rgba(251, 191, 36, 0.5)",
                    "0 0 15px rgba(251, 191, 36, 0.3)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-4 h-4 text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-bold text-amber-400 tracking-wide">PRO MEMBER</p>
                <p className="text-[10px] text-white/40">All features unlocked</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#0099FF]" />
                <span className="text-xs font-bold text-white tracking-wide">UPGRADE TO PRO</span>
              </div>
              <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
                AI forecasts, investor reports & unlimited simulations
              </p>
              <motion.button 
                className="w-full py-2.5 px-4 rounded-lg bg-[#0099FF] text-white text-xs font-bold tracking-wide"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(0, 153, 255, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={springTransition}
              >
                Upgrade Now
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Version Footer */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-white/20 text-center tracking-wider">
          v2.0 · SUPERLIST EDITION
        </p>
      </div>
    </aside>
  );
};

export default AppSidebar;
