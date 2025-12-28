import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, FlaskConical, Archive, Wrench, Settings, Crown, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const navigation = [
  {
    name: "DNA Lab",
    href: "/",
    icon: FlaskConical,
    color: "#0099FF", // Azure
  },
  {
    name: "Archive",
    href: "/archive",
    icon: Archive,
    color: "#22C55E", // Green
  },
  {
    name: "Toolkit",
    href: "/toolkit",
    icon: Wrench,
    color: "#F59E0B", // Amber
  },
  {
    name: "Scale Hub",
    href: "/settings",
    icon: Settings,
    color: "#A855F7", // Purple
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

  // Spring transition config
  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  return (
    <aside className="glass-sidebar w-64 min-h-screen flex flex-col">
      {/* Logo - Ultra minimal */}
      <div className="p-5 border-b border-white/[0.06]">
        <motion.div 
          onClick={handleHomeClick}
          className="flex items-center gap-3 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
        >
          <div className="w-9 h-9 rounded-lg bg-[#0099FF] flex items-center justify-center shadow-glow-primary">
            <Dna className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Runway DNA</h1>
          </div>
        </motion.div>
      </div>

      {/* Analysis/Simulation Toggle */}
      <div className="px-4 py-4">
        <div className="context-toggle">
          <motion.button
            onClick={() => setMode('analysis')}
            className={`context-toggle-option ${mode === 'analysis' ? 'active' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
          >
            Analysis
          </motion.button>
          <motion.button
            onClick={() => setMode('simulation')}
            className={`context-toggle-option ${mode === 'simulation' ? 'active' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
          >
            Simulation
          </motion.button>
        </div>
      </div>

      {/* Navigation - Ultra minimal with color on hover */}
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springTransition, delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-white/[0.08]' 
                    : 'hover:bg-white/[0.04]'
                  }`}
              >
                {/* Active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={springTransition}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon - Monochrome, color on hover/active */}
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? `${item.color}15` : 'transparent',
                  }}
                >
                  <Icon 
                    className="w-4 h-4 transition-colors duration-200"
                    style={{
                      color: isActive ? item.color : 'rgba(255,255,255,0.4)',
                    }}
                  />
                </div>

                {/* Label */}
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/50 group-hover:text-white/80'
                }`}>
                  {item.name}
                </span>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Pro Badge - Minimal */}
      <div className="p-4">
        <motion.div 
          className="glass-card p-4"
          whileHover={{ scale: 1.02 }}
          transition={springTransition}
        >
          {user.isPro ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-500">PRO</p>
                <p className="text-[11px] text-white/40">All features</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#0099FF]" />
                <span className="text-xs font-semibold text-white">Go Pro</span>
              </div>
              <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
                Unlock AI forecasts & investor reports
              </p>
              <motion.button 
                className="w-full py-2 px-3 rounded-lg bg-[#0099FF] text-white text-xs font-semibold shadow-glow-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springTransition}
              >
                Upgrade
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </aside>
  );
};

export default AppSidebar;
