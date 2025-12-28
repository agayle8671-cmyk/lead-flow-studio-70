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
      <nav className="flex-1 p-4 space-y-1">
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
