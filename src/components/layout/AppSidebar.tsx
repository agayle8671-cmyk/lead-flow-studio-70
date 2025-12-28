import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dna, FlaskConical, Archive, Wrench, Settings, Crown, CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

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
  const navigate = useNavigate();
  const { user } = useApp();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/");
    }
  };

  return (
    <aside className="glass-sidebar w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <div 
          onClick={handleHomeClick}
          className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80"
        >
          <div className="w-10 h-10 rounded-xl bg-[hsl(211,100%,45%)] flex items-center justify-center">
            <Dna className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Runway DNA</h1>
            <p className="text-xs text-[hsl(0,0%,53%)]">Founder Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isActive 
                  ? "bg-[hsl(211,100%,45%)]" 
                  : "bg-white/[0.04]"
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[hsl(0,0%,53%)]"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isActive ? "text-white" : "text-[hsl(0,0%,80%)]"}`}>
                  {item.name}
                </p>
                <p className="text-xs text-[hsl(0,0%,40%)] truncate">
                  {item.description}
                </p>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Pro Badge */}
      <div className="p-4">
        <div className="card-surface p-4">
          {user.isPro ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-[hsl(35,100%,52%)]" />
                <span className="text-xs font-semibold text-[hsl(35,100%,52%)]">PRO MEMBER</span>
              </div>
              <p className="text-xs text-[hsl(0,0%,53%)] mb-3">
                All features unlocked
              </p>
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[hsl(142,69%,50%,0.1)] border border-[hsl(142,69%,50%,0.2)]">
                <CheckCircle className="w-4 h-4 text-[hsl(142,69%,50%)]" />
                <span className="text-xs font-medium text-[hsl(142,69%,50%)]">Active Subscription</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Dna className="w-4 h-4 text-[hsl(211,100%,45%)]" />
                <span className="text-xs font-semibold text-[hsl(211,100%,45%)]">FOUNDER PRO</span>
              </div>
              <p className="text-xs text-[hsl(0,0%,53%)] mb-3">
                Unlock AI-powered forecasts & investor reports
              </p>
              <button className="w-full py-2.5 px-3 rounded-lg bg-[hsl(211,100%,45%)] text-white text-sm font-medium transition-colors hover:bg-[hsl(211,100%,50%)]">
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0">
        <p className="text-[11px] text-[hsl(0,0%,35%)] text-center">
          Built for founders who move fast
        </p>
      </div>
    </aside>
  );
};

export default AppSidebar;
