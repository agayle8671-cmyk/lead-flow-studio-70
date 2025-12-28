import { motion } from "framer-motion";
import { 
  Briefcase, 
  Dna, 
  Archive, 
  Settings, 
  Compass, 
  LogOut,
  ChevronLeft,
  Building2,
  CreditCard,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePlan } from "@/contexts/PlanContext";

type NavItem = "portfolio" | "lab" | "archive" | "settings" | "licensing" | "resources";

interface AppSidebarProps {
  activeNav: NavItem;
  onNavChange: (item: NavItem) => void;
}

const AppSidebar = ({ activeNav, onNavChange }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const { isFirm, plan } = usePlan();

  const navItems = [
    { id: "portfolio" as NavItem, icon: Briefcase, label: "Client Portfolio" },
    { id: "lab" as NavItem, icon: Dna, label: "Runway DNA" },
    { id: "archive" as NavItem, icon: Archive, label: "Audit Archive" },
    { id: "resources" as NavItem, icon: BookOpen, label: "Resource Centre" },
    { id: "settings" as NavItem, icon: Settings, label: "Firm Settings" },
  ];

  const handleLogout = () => {
    window.location.reload();
  };

  const getPlanLabel = () => {
    return plan === "firm" ? "Firm Scale" : "Solo Auditor";
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border">
        <a href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center shadow-gold">
            <Compass className="w-5 h-5 text-charcoal" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-lg font-bold tracking-tight text-foreground">M.A.P.</span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Margin Audit Pro</span>
            </motion.div>
          )}
        </a>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              activeNav === item.id
                ? "nav-active"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            }`}
          >
            <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
              activeNav === item.id ? "text-primary" : "group-hover:text-foreground"
            }`} />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Licensing CTA */}
      {!collapsed && !isFirm && (
        <div className="p-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-4 rounded-xl overflow-hidden border-glow"
            style={{
              background: "linear-gradient(145deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.02))",
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md gradient-gold flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-charcoal" />
                </div>
                <span className="font-semibold text-sm text-foreground">Scale Your Practice</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Upgrade to Firm Scale for unlimited Portfolio Management
              </p>
              <Button 
                size="sm" 
                className="w-full gradient-gold text-charcoal font-semibold shadow-gold hover:shadow-lg transition-shadow"
                onClick={() => onNavChange("licensing")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <span className="text-sm font-semibold text-primary">FA</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">Firm Administrator</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isFirm ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground">{getPlanLabel()}</span>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-destructive/10 transition-colors group"
          >
            <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
