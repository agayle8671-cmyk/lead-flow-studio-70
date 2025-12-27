import { motion } from "framer-motion";
import { Settings, Building2, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/contexts/PlanContext";
import { forwardRef } from "react";

const FirmSettings = forwardRef<HTMLDivElement>((_, ref) => {
  const { isFirm, plan } = usePlan();

  const getPlanLabel = () => {
    return plan === "firm" ? "Firm Scale" : "Solo Auditor";
  };

  return (
    <div ref={ref} className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-5">
          <h1 className="text-xl font-bold tracking-tight">Firm Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your practice and team preferences</p>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Firm Profile */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Firm Profile</h2>
                <p className="text-sm text-muted-foreground">Your practice details</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Firm Name</span>
                <span className="text-sm font-medium">Your Accounting Firm</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className={`text-sm font-medium ${isFirm ? 'text-primary' : ''}`}>
                  {getPlanLabel()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Active Clients</span>
                <span className="text-sm font-medium">3</span>
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Team Management</h2>
                <p className="text-sm text-muted-foreground">Manage staff access</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Team features available on Firm Scale</p>
                <p className="text-xs text-muted-foreground">Add staff members and manage permissions</p>
              </div>
              <Button size="sm" disabled={isFirm}>
                {isFirm ? 'Manage Team' : 'Upgrade'}
              </Button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Security</h2>
                <p className="text-sm text-muted-foreground">Account protection settings</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Two-Factor Authentication</span>
                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Session Timeout</span>
                <span className="text-sm font-medium">30 minutes</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
});

FirmSettings.displayName = "FirmSettings";

export default FirmSettings;
