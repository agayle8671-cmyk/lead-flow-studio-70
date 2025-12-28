import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Key,
  CreditCard,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

type SettingsPanelType = "profile" | "notifications" | "security" | "appearance" | "api" | "subscription";

interface SettingsPanelProps {
  type: SettingsPanelType;
  onClose: () => void;
}

const panelConfig: Record<SettingsPanelType, { icon: typeof User; title: string; color: string }> = {
  profile: { icon: User, title: "Profile Settings", color: "hsl(226, 100%, 59%)" },
  notifications: { icon: Bell, title: "Notification Preferences", color: "hsl(270, 60%, 55%)" },
  security: { icon: Shield, title: "Security Settings", color: "hsl(0, 70%, 55%)" },
  appearance: { icon: Palette, title: "Appearance", color: "hsl(45, 90%, 55%)" },
  api: { icon: Key, title: "API Access", color: "hsl(152, 100%, 50%)" },
  subscription: { icon: CreditCard, title: "Subscription", color: "hsl(35, 100%, 50%)" },
};

// Profile Panel
function ProfilePanel() {
  const [name, setName] = useState("Founder");
  const [email, setEmail] = useState("founder@startup.com");
  const [company, setCompany] = useState("My Startup");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Profile Updated", description: "Your profile has been saved." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(226,100%,59%)] to-[hsl(270,60%,55%)] flex items-center justify-center text-3xl font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{name}</p>
          <p className="text-[hsl(220,10%,50%)] text-sm">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">Full Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 bg-[hsl(240,7%,8%)] border-white/10 text-white"
          />
        </div>
        <div>
          <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 bg-[hsl(240,7%,8%)] border-white/10 text-white"
          />
        </div>
        <div>
          <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">Company</Label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 bg-[hsl(240,7%,8%)] border-white/10 text-white"
          />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full bg-[hsl(226,100%,59%)] hover:bg-[hsl(226,100%,65%)]">
        {saved ? <Check className="w-4 h-4 mr-2" /> : null}
        {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  );
}

// Notifications Panel
function NotificationsPanel() {
  const { user, updateSettings } = useApp();
  const [emailDigest, setEmailDigest] = useState(true);
  const [runwayAlerts, setRunwayAlerts] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(true);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5">
          <div>
            <p className="text-white font-medium">Push Notifications</p>
            <p className="text-[hsl(220,10%,50%)] text-sm">Receive browser notifications</p>
          </div>
          <Switch 
            checked={user.pushNotifications} 
            onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5">
          <div>
            <p className="text-white font-medium">Weekly Reports</p>
            <p className="text-[hsl(220,10%,50%)] text-sm">Get weekly financial insights</p>
          </div>
          <Switch 
            checked={user.weeklyReports} 
            onCheckedChange={(checked) => updateSettings({ weeklyReports: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5">
          <div>
            <p className="text-white font-medium">Email Digest</p>
            <p className="text-[hsl(220,10%,50%)] text-sm">Daily summary of your metrics</p>
          </div>
          <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5">
          <div>
            <p className="text-white font-medium">Runway Alerts</p>
            <p className="text-[hsl(220,10%,50%)] text-sm">Alert when runway drops below threshold</p>
          </div>
          <Switch checked={runwayAlerts} onCheckedChange={setRunwayAlerts} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5">
          <div>
            <p className="text-white font-medium">Analysis Complete</p>
            <p className="text-[hsl(220,10%,50%)] text-sm">Notify when analysis finishes</p>
          </div>
          <Switch checked={analysisComplete} onCheckedChange={setAnalysisComplete} />
        </div>
      </div>
    </div>
  );
}

// Security Panel
function SecurityPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
        <h3 className="text-white font-semibold mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">Current Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10 bg-[hsl(240,7%,8%)] border-white/10 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,50%)] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">New Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 bg-[hsl(240,7%,8%)] border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-[hsl(220,10%,55%)] text-xs uppercase tracking-wider">Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 bg-[hsl(240,7%,8%)] border-white/10 text-white"
            />
          </div>
          <Button onClick={handleChangePassword} className="w-full bg-[hsl(0,70%,55%)] hover:bg-[hsl(0,70%,60%)]">
            Update Password
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,7%,12%)] border border-white/5">
        <div>
          <p className="text-white font-medium">Two-Factor Authentication</p>
          <p className="text-[hsl(220,10%,50%)] text-sm">Add an extra layer of security</p>
        </div>
        <Switch 
          checked={twoFactorEnabled} 
          onCheckedChange={(checked) => {
            setTwoFactorEnabled(checked);
            toast({ 
              title: checked ? "2FA Enabled" : "2FA Disabled", 
              description: checked ? "Two-factor authentication is now active" : "Two-factor authentication has been disabled"
            });
          }}
        />
      </div>
    </div>
  );
}

// Appearance Panel
function AppearancePanel() {
  const { user, toggleDarkMode } = useApp();
  const [accentColor, setAccentColor] = useState("cobalt");

  const themes = [
    { id: "dark", name: "Dark", icon: Moon },
    { id: "light", name: "Light", icon: Sun },
    { id: "system", name: "System", icon: Monitor },
  ];

  const accents = [
    { id: "cobalt", color: "hsl(226, 100%, 59%)", name: "Cobalt" },
    { id: "emerald", color: "hsl(152, 100%, 50%)", name: "Emerald" },
    { id: "violet", color: "hsl(270, 60%, 55%)", name: "Violet" },
    { id: "amber", color: "hsl(45, 90%, 55%)", name: "Amber" },
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
        <h3 className="text-white font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                if (theme.id === "dark" && !user.darkMode) toggleDarkMode();
                if (theme.id === "light" && user.darkMode) toggleDarkMode();
              }}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                (theme.id === "dark" && user.darkMode) || (theme.id === "light" && !user.darkMode)
                  ? "border-[hsl(226,100%,59%)] bg-[hsl(226,100%,59%)/0.1]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <theme.icon className={`w-6 h-6 ${
                (theme.id === "dark" && user.darkMode) || (theme.id === "light" && !user.darkMode)
                  ? "text-[hsl(226,100%,59%)]" 
                  : "text-[hsl(220,10%,50%)]"
              }`} />
              <span className="text-sm text-white">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
        <h3 className="text-white font-semibold mb-4">Accent Color</h3>
        <div className="grid grid-cols-4 gap-3">
          {accents.map((accent) => (
            <button
              key={accent.id}
              onClick={() => {
                setAccentColor(accent.id);
                toast({ title: "Accent Changed", description: `Accent color set to ${accent.name}` });
              }}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                accentColor === accent.id
                  ? "border-white/30"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div 
                className="w-8 h-8 rounded-full"
                style={{ background: accent.color }}
              />
              <span className="text-xs text-[hsl(220,10%,60%)]">{accent.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// API Panel
function APIPanel() {
  const [apiKey] = useState("rw_dna_sk_live_" + Math.random().toString(36).substring(2, 15));
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({ title: "Copied!", description: "API key copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    toast({ title: "API Key Regenerated", description: "Your new API key has been generated. The old key is now invalid." });
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
        <h3 className="text-white font-semibold mb-2">Your API Key</h3>
        <p className="text-[hsl(220,10%,50%)] text-sm mb-4">Use this key to access the Runway DNA API</p>
        
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            value={apiKey}
            readOnly
            className="pr-24 bg-[hsl(240,7%,8%)] border-white/10 text-white font-mono text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 rounded hover:bg-white/10 text-[hsl(220,10%,50%)] hover:text-white transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-white/10 text-[hsl(220,10%,50%)] hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[hsl(152,100%,50%)]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button 
          onClick={handleRegenerate}
          variant="outline" 
          className="w-full mt-4 border-[hsl(0,70%,55%)/0.3] hover:border-[hsl(0,70%,55%)/0.6] text-[hsl(0,70%,55%)]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate Key
        </Button>
      </div>

      <div className="p-5 rounded-2xl bg-[hsl(152,100%,50%)/0.08] border border-[hsl(152,100%,50%)/0.2]">
        <h3 className="text-white font-semibold mb-2">API Usage</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(220,10%,55%)]">Requests this month</span>
          <span className="text-white font-medium">247 / ∞</span>
        </div>
        <div className="h-2 bg-[hsl(240,7%,15%)] rounded-full mt-2 overflow-hidden">
          <div className="h-full w-1/4 bg-gradient-to-r from-[hsl(152,100%,45%)] to-[hsl(152,100%,55%)] rounded-full" />
        </div>
        <p className="text-[hsl(152,100%,60%)] text-xs mt-2">Unlimited requests on Pro plan</p>
      </div>
    </div>
  );
}

// Subscription Panel
function SubscriptionPanel() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(45,90%,55%)/0.15] to-[hsl(35,100%,50%)/0.1] border border-[hsl(45,90%,55%)/0.3]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(45,90%,55%)] to-[hsl(35,100%,50%)] flex items-center justify-center">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Pro Plan</h3>
            <p className="text-[hsl(152,100%,50%)] text-sm font-medium">Active</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[hsl(220,10%,70%)]">
            <Check className="w-4 h-4 text-[hsl(152,100%,50%)]" />
            <span>Unlimited financial analyses</span>
          </div>
          <div className="flex items-center gap-2 text-[hsl(220,10%,70%)]">
            <Check className="w-4 h-4 text-[hsl(152,100%,50%)]" />
            <span>All toolkit features</span>
          </div>
          <div className="flex items-center gap-2 text-[hsl(220,10%,70%)]">
            <Check className="w-4 h-4 text-[hsl(152,100%,50%)]" />
            <span>Unlimited API access</span>
          </div>
          <div className="flex items-center gap-2 text-[hsl(220,10%,70%)]">
            <Check className="w-4 h-4 text-[hsl(152,100%,50%)]" />
            <span>Priority support</span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[hsl(240,7%,12%)] border border-white/5">
        <h3 className="text-white font-semibold mb-4">Billing Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(220,10%,55%)]">Plan</span>
            <span className="text-white">Pro (Annual)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(220,10%,55%)]">Price</span>
            <span className="text-white">$99/year</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(220,10%,55%)]">Next billing date</span>
            <span className="text-white">Dec 28, 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(220,10%,55%)]">Payment method</span>
            <span className="text-white">•••• 4242</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full border-white/10 hover:border-white/20 text-[hsl(220,10%,70%)]">
        Manage Billing
      </Button>
    </div>
  );
}

export function SettingsPanel({ type, onClose }: SettingsPanelProps) {
  const config = panelConfig[type];
  const Icon = config.icon;

  const renderContent = () => {
    switch (type) {
      case "profile": return <ProfilePanel />;
      case "notifications": return <NotificationsPanel />;
      case "security": return <SecurityPanel />;
      case "appearance": return <AppearancePanel />;
      case "api": return <APIPanel />;
      case "subscription": return <SubscriptionPanel />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[hsl(240,15%,8%)] via-[hsl(220,20%,10%)] to-[hsl(240,15%,8%)] border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10"
            style={{ background: `linear-gradient(135deg, ${config.color}, transparent)` }}
          />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${config.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: config.color }} />
              </div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/10 hover:border-white/20 text-white"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export type { SettingsPanelType };


