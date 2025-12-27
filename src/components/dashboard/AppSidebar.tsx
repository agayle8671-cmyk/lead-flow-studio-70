import { motion } from "framer-motion";
import { 
  Briefcase, 
  FlaskConical, 
  Archive, 
  Settings, 
  Compass, 
  LogOut,
  ChevronLeft,
  Rocket,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePlan } from "@/contexts/PlanContext";
import { apiUrl } from "@/lib/config";

type NavItem = "portfolio" | "lab" | "archive" | "settings";

interface AppSidebarProps {
  activeNav: NavItem;
  onNavChange: (item: NavItem) => void;
}

const AppSidebar = ({ activeNav, onNavChange }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();
  const { isPro } = usePlan();

  const navItems = [
    { id: "portfolio" as NavItem, icon: Briefcase, label: "Client Portfolio" },
    { id: "lab" as NavItem, icon: FlaskConical, label: "Audit Lab" },
    { id: "archive" as NavItem, icon: Archive, label: "Audit Archive" },
    { id: "settings" as NavItem, icon: Settings, label: "Firm Settings" },
  ];

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch(apiUrl("/api/create-checkout-session"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "Could not initiate checkout. Please try again.",
      });
      setIsUpgrading(false);
    }
  };

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col h-screen border-r border-border bg-card transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <motion.div 
              className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <Compass className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight leading-none">M.A.P.</span>
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase">Margin Audit Pro</span>
              </div>
            )}
          </a>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <motion.li 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => onNavChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  activeNav === item.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${activeNav === item.id ? "text-primary" : ""}`} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && !isPro && (
        <div className="p-3">
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Founder's Deal</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              50% off for early adopters.
            </p>
            <Button 
              size="sm" 
              className="w-full"
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              {isUpgrading ? "Redirecting..." : "Upgrade Now"}
            </Button>
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <span className="text-sm font-semibold text-primary">FA</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Firm Administrator</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-primary' : 'bg-muted-foreground'}`} />
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
          >
            <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
