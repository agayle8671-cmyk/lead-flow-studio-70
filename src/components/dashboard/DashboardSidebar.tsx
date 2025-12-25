import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Sparkles, 
  LogOut,
  ChevronLeft,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DashboardSidebarProps {
  userName: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: History, label: "History", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const DashboardSidebar = ({ userName }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && <span className="text-lg font-bold">ProfitPulse</span>}
          </a>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && (
        <div className="p-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Founder's Deal</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock advanced features with 50% off for early adopters.
            </p>
            <Button variant="hero" size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          )}
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
