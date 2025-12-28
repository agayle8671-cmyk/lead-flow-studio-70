import { motion } from "framer-motion";
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
  Zap,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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

const ScaleHub = () => {
  return (
    <div className="min-h-screen w-full p-8">
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
        className="glass-panel-intense p-6 mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(260,80%,55%)] flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Founder Plan</h2>
              <span className="px-2 py-0.5 rounded-full bg-[hsl(226,100%,59%)/0.2] text-[hsl(226,100%,68%)] text-xs font-medium">
                ACTIVE
              </span>
            </div>
            <p className="text-[hsl(220,10%,50%)] text-sm">
              3 analyses remaining this month
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-[hsl(226,100%,59%)/0.3] hover:border-[hsl(226,100%,59%)/0.6] text-white"
        >
          Upgrade Plan
        </Button>
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
                  <Moon className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                  <span className="text-white text-sm">Dark Mode</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                  <span className="text-white text-sm">Push Notifications</span>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-[hsl(226,100%,59%)]" />
                  <span className="text-white text-sm">Weekly Reports</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel p-6 border-[hsl(0,70%,50%)/0.2]">
            <h3 className="text-[hsl(0,70%,55%)] font-semibold mb-4">Danger Zone</h3>
            <Button
              variant="outline"
              className="w-full border-[hsl(0,70%,50%)/0.3] hover:border-[hsl(0,70%,50%)/0.6] hover:bg-[hsl(0,70%,50%)/0.1] text-[hsl(0,70%,55%)]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScaleHub;
