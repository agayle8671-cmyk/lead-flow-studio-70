import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
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

interface DashboardSidebarProps {
  userName: string;
}

type NavItem = "dashboard" | "archive" | "settings";

const DashboardSidebar = ({ userName }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<NavItem>("dashboard");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();
  const { isPro } = usePlan();

  const navItems = [
    { id: "dashboard" as NavItem, icon: LayoutDashboard, label: "Command Center" },
    { id: "archive" as NavItem, icon: Archive, label: "Audit Archive" },
    { id: "settings" as NavItem, icon: Settings, label: "Settings" },
  ];

  const handleNavClick = (id: NavItem) => {
    setActiveItem(id);
    if (id !== "dashboard") {
      toast({
        title: `${id === "archive" ? "Audit Archive" : "Settings"} coming soon`,
        description: "This feature is currently under development.",
      });
    }
  };

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
      transition={{ duration: 0.5 }}
      className={`flex flex-col h-screen border-r border-border transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
      style={{
        background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Compass className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            {!collapsed && (
              <div className="flex flex-col">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-bold tracking-tight leading-none"
                >
                  M.A.P.
                </motion.span>
                <span className="text-[9px] text-muted-foreground tracking-wide">MARGIN AUDIT PRO</span>
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
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <motion.li 
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeItem === item.id
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${activeItem === item.id ? "text-primary" : ""}`} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
                {activeItem === item.id && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Upgrade CTA - Only show for free users */}
      {!collapsed && !isPro && (
        <div className="p-4">
          <motion.div 
            className="relative p-5 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
            }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <Crown className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">Founder's Deal</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Unlock advanced AI insights with 50% off for early adopters.
              </p>
              <Button 
                variant="hero" 
                size="sm" 
                className="w-full shadow-lg shadow-primary/20"
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
          </motion.div>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-semibold text-primary">
              {userName.charAt(0).toUpperCase()}
            </span>
          </motion.div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-primary' : 'bg-muted-foreground'} animate-pulse`} />
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>
          )}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
          >
            <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
