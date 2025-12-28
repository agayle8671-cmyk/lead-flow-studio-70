import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'analysis' | 'simulation'>('analysis');

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/");
    }
  };

  // Ultra-smooth spring
  const spring = {
    type: "spring" as const,
    stiffness: 200,
    damping: 30,
  };

  // Navigation - text only, architectural
  const navigation = [
    { name: "Lab", href: "/" },
    { name: "Archive", href: "/archive" },
    { name: "Toolkit", href: "/toolkit" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-black">
      {/* ═══════════════════════════════════════════════════════════════════
          LOGO - Minimal typemark
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div 
        className="pt-10 px-8 pb-16 cursor-pointer"
        onClick={handleLogoClick}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-[11px] font-medium tracking-[0.3em] text-white uppercase">
          Runway
        </h1>
        <h1 className="text-[11px] font-medium tracking-[0.3em] text-white/40 uppercase">
          DNA
        </h1>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODE TOGGLE - Minimal text switch
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="px-8 pb-12">
        <div className="flex gap-6">
          <motion.button
            onClick={() => setMode('analysis')}
            className="relative text-[11px] tracking-[0.15em] uppercase"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className={mode === 'analysis' ? 'text-white' : 'text-white/30'}>
              Analysis
            </span>
            <AnimatePresence>
              {mode === 'analysis' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={spring}
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white origin-left"
                />
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => setMode('simulation')}
            className="relative text-[11px] tracking-[0.15em] uppercase"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className={mode === 'simulation' ? 'text-white' : 'text-white/30'}>
              Simulate
            </span>
            <AnimatePresence>
              {mode === 'simulation' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={spring}
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white origin-left"
                />
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          NAVIGATION - Text links, no icons
      ═══════════════════════════════════════════════════════════════════ */}
      <nav className="flex-1 px-8">
        <div className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: index * 0.05 }}
                  className="relative py-3 group"
                >
                  {/* Active line indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={spring}
                        className="absolute left-[-32px] top-1/2 -translate-y-1/2 w-[1px] h-4 bg-white origin-center"
                      />
                    )}
                  </AnimatePresence>

                  <motion.span 
                    className={`text-[13px] tracking-[0.02em] transition-colors duration-300 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-white/30 group-hover:text-white/60'
                    }`}
                  >
                    {item.name}
                  </motion.span>
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER - Minimal
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="px-8 py-10">
        <motion.a
          href="#"
          className="text-[10px] tracking-[0.2em] text-white/20 uppercase hover:text-white/40 transition-colors duration-300"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          Upgrade →
        </motion.a>
      </div>

      {/* Vertical border line */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/[0.06]" />
    </aside>
  );
};

export default AppSidebar;
