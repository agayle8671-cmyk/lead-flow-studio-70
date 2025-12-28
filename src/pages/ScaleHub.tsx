import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsPanel, SettingsPanelType } from "@/components/settings/SettingsPanel";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  CreditCard, 
  Key,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Crown,
  AlertTriangle,
  Activity,
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useApp, DriftAnomaly } from "@/contexts/AppContext";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", description: "Manage your account details" },
      { icon: Bell, label: "Notifications", description: "Email and push preferences" },
      { icon: Shield, label: "Security", description: "Password and 2FA settings" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Palette, label: "Appearance", description: "Theme and display options" },
      { icon: Key, label: "API Access", description: "Manage API keys" },
    ],
  },
  {
    title: "Billing",
    items: [
      { icon: CreditCard, label: "Subscription", description: "Manage your plan" },
    ],
  },
];

// Map settings labels to panel types
const labelToPanelType: Record<string, SettingsPanelType> = {
  "Profile": "profile",
  "Notifications": "notifications",
  "Security": "security",
  "Appearance": "appearance",
  "API Access": "api",
  "Subscription": "subscription",
};

const ScaleHub = forwardRef<HTMLDivElement>((_, ref) => {
  const { user, updateSettings, toggleDarkMode, signOut, weeklyBrief, clearWeeklyBrief } = useApp();
  const [activePanel, setActivePanel] = useState<SettingsPanelType | null>(null);

  const handleClearWeeklyBrief = () => {
    clearWeeklyBrief();
    toast({
      title: "Weekly Brief Cleared",
      description: "All drift anomalies have been removed.",
    });
  };

  const formatDriftValue = (anomaly: DriftAnomaly) => {
    if (anomaly.type === "burn") {
      return `$${Math.round(anomaly.actualValue).toLocaleString()}`;
    }
    return `${anomaly.actualValue.toFixed(1)} months`;
  };

  const handleSettingClick = (label: string) => {
    const panelType = labelToPanelType[label];
    if (panelType) {
      setActivePanel(panelType);
    }
  };

  const handleSignOut = () => {
    toast({
      title: "Signing Out...",
      description: "You will be redirected shortly.",
    });
    // Small delay for toast to show, then sign out
    setTimeout(() => {
      signOut();
    }, 500);
  };

  const handlePushNotificationsChange = (checked: boolean) => {
    updateSettings({ pushNotifications: checked });
    toast({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
      description: checked 
        ? "You'll now receive push notifications." 
        : "Push notifications have been turned off.",
    });
  };

  const handleWeeklyReportsChange = (checked: boolean) => {
    updateSettings({ weeklyReports: checked });
    toast({
      title: checked ? "Weekly Reports Enabled" : "Weekly Reports Disabled",
      description: checked 
        ? "You'll receive weekly financial insights." 
        : "Weekly reports have been turned off.",
    });
  };

  const handleDarkModeChange = () => {
    toggleDarkMode();
    toast({
      title: user.darkMode ? "Light Mode Activated" : "Dark Mode Activated",
      description: user.darkMode 
        ? "Switched to light theme." 
        : "Switched to dark theme.",
    });
  };

  return (
    <div ref={ref} className="min-h-screen w-full p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gradient-cobalt mb-1">Scale Hub</h1>
        <p className="text-[hsl(220,10%,50%)] text-sm">
          Configure your Runway DNA experience
        </p>
      </motion.header>

      {/* Current Plan Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-panel-intense p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          user.isPro ? '' : 'border-[hsl(226,100%,59%)/0.2]'
        }`}
      >
        {user.isPro ? (
          <>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(45,90%,55%)] to-[hsl(35,100%,50%)] flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Pro Plan</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[hsl(152,100%,50%)/0.2] text-[hsl(152,100%,50%)] text-xs font-medium">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[hsl(220,10%,50%)] text-sm">
                  Unlimited analyses • All features unlocked
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[hsl(152,100%,50%)]">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">All Access</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] flex items-center justify-center">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Free Plan</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[hsl(226,100%,59%)/0.2] text-[hsl(226,100%,59%)] text-xs font-medium">
                    CURRENT
                  </span>
                </div>
                <p className="text-[hsl(220,10%,50%)] text-sm">
                  3 analyses/month • Basic features
                </p>
              </div>
            </div>
            <Button
              onClick={() => toast({
                title: "You're Already Pro!",
                description: "All premium features are unlocked and ready to use.",
              })}
              className="bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] hover:opacity-90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </>
        )}
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings List */}
        <div className="lg:col-span-2 space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * sectionIndex + 0.2 }}
            >
              <h3 className="text-sm font-medium text-[hsl(220,10%,50%)] uppercase tracking-wider mb-3 px-1">
                {section.title}
              </h3>
              <div className="glass-panel overflow-hidden divide-y divide-white/5">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * itemIndex + 0.1 * sectionIndex + 0.3 }}
                    onClick={() => handleSettingClick(item.label)}
                    className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(226,100%,59%)/0.1] flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-[hsl(226,100%,68%)] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[hsl(220,10%,50%)] text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[hsl(220,10%,40%)] group-hover:text-[hsl(226,100%,59%)] transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Theme Toggle */}
          <div className="glass-panel p-6">
            <h3 className="text-white font-semibold mb-4">Quick Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.darkMode ? (
                    <Moon className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                  )}
                  <span className="text-white text-sm">Dark Mode</span>
                </div>
                <Switch 
                  checked={user.darkMode} 
                  onCheckedChange={handleDarkModeChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                  <span className="text-white text-sm">Push Notifications</span>
                </div>
                <Switch 
                  checked={user.pushNotifications} 
                  onCheckedChange={handlePushNotificationsChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                  <span className="text-white text-sm">Weekly Reports</span>
                </div>
                <Switch 
                  checked={user.weeklyReports} 
                  onCheckedChange={handleWeeklyReportsChange}
                />
              </div>
            </div>
          </div>

          {/* Weekly Brief - DNA Drift Notifications */}
          <div className="glass-panel p-6 border-[hsl(270,60%,55%)/0.2]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[hsl(270,60%,65%)]" />
                <h3 className="text-[hsl(270,60%,65%)] font-semibold">Weekly Brief</h3>
                {weeklyBrief.anomalies.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[hsl(270,60%,55%)/0.2] text-[hsl(270,60%,65%)] text-xs font-bold">
                    {weeklyBrief.anomalies.length}
                  </span>
                )}
              </div>
              {weeklyBrief.anomalies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearWeeklyBrief}
                  className="text-[hsl(220,10%,50%)] hover:text-[hsl(0,70%,55%)] hover:bg-[hsl(0,70%,50%)/0.1]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {weeklyBrief.anomalies.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-xl bg-[hsl(270,60%,55%)/0.1] flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-[hsl(270,60%,55%)]" />
                </div>
                <p className="text-[hsl(220,10%,50%)] text-sm">No drift anomalies detected</p>
                <p className="text-[hsl(220,10%,40%)] text-xs mt-1">Anomalies from DNA Lab will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {weeklyBrief.anomalies.map((anomaly) => (
                  <motion.div
                    key={anomaly.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-xl border ${
                      Math.abs(anomaly.driftPercentage) > 10
                        ? "bg-[hsl(0,70%,50%)/0.1] border-[hsl(0,70%,50%)/0.2]"
                        : Math.abs(anomaly.driftPercentage) > 5
                          ? "bg-[hsl(45,90%,55%)/0.1] border-[hsl(45,90%,55%)/0.2]"
                          : "bg-[hsl(226,100%,59%)/0.1] border-[hsl(226,100%,59%)/0.2]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        Math.abs(anomaly.driftPercentage) > 10
                          ? "bg-[hsl(0,70%,50%)/0.2]"
                          : Math.abs(anomaly.driftPercentage) > 5
                            ? "bg-[hsl(45,90%,55%)/0.2]"
                            : "bg-[hsl(226,100%,59%)/0.2]"
                      }`}>
                        {anomaly.driftPercentage > 0 ? (
                          <TrendingUp className={`w-4 h-4 ${
                            anomaly.type === "burn" ? "text-[hsl(0,70%,55%)]" : "text-[hsl(152,100%,50%)]"
                          }`} />
                        ) : (
                          <TrendingDown className={`w-4 h-4 ${
                            anomaly.type === "burn" ? "text-[hsl(152,100%,50%)]" : "text-[hsl(0,70%,55%)]"
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {anomaly.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[hsl(220,10%,50%)] text-xs">
                            {formatDriftValue(anomaly)}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            Math.abs(anomaly.driftPercentage) > 10
                              ? "bg-[hsl(0,70%,50%)/0.2] text-[hsl(0,70%,65%)]"
                              : "bg-[hsl(45,90%,55%)/0.2] text-[hsl(45,90%,65%)]"
                          }`}>
                            {anomaly.driftPercentage > 0 ? "+" : ""}{anomaly.driftPercentage.toFixed(1)}%
                          </span>
                          <span className="text-[hsl(220,10%,40%)] text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(anomaly.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {weeklyBrief.lastUpdated && weeklyBrief.anomalies.length > 0 && (
              <p className="text-[hsl(220,10%,40%)] text-xs mt-3 text-center">
                Last updated: {new Date(weeklyBrief.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="glass-panel p-6 border-[hsl(0,70%,50%)/0.2]">
            <h3 className="text-[hsl(0,70%,55%)] font-semibold mb-4">Danger Zone</h3>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full border-[hsl(0,70%,50%)/0.3] hover:border-[hsl(0,70%,50%)/0.6] hover:bg-[hsl(0,70%,50%)/0.1] text-[hsl(0,70%,55%)]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Settings Panels */}
      <AnimatePresence>
        {activePanel && (
          <SettingsPanel 
            type={activePanel} 
            onClose={() => setActivePanel(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
});

ScaleHub.displayName = "ScaleHub";

export default ScaleHub;
