import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight, RefreshCw, Loader2, TrendingUp, Users, Calendar, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClient, Client } from "@/contexts/ClientContext";
import { usePlan } from "@/contexts/PlanContext";
import { format } from "date-fns";
import UpgradeModal from "./UpgradeModal";
import { cn } from "@/lib/utils";

interface ClientPortfolioProps {
  onClientSelect: (client: Client) => void;
}

const ClientPortfolio = ({ onClientSelect }: ClientPortfolioProps) => {
  const { clients, filteredClients, isLoading, error, refreshClients, uploadedCIDs, filterByUploadedCIDs, setFilterByUploadedCIDs } = useClient();
  const { clientLimit, isFirm } = usePlan();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Apply tier limit - Solo tier shows max 10 clients
  const displayedClients = (filterByUploadedCIDs ? filteredClients : clients).slice(0, clientLimit);
  const hasHiddenClients = clients.length > clientLimit;
  const isAtLimit = clients.length >= clientLimit;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return "—";
    }
  };

  const getGradeClass = (grade: string | null) => {
    switch (grade) {
      case "A": return "badge-grade-a";
      case "B": return "badge-grade-b";
      case "C": return "badge-grade-c";
      case "F": return "badge-grade-f";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Stats summary - only count displayed clients
  const totalClients = displayedClients.length;
  const avgScore = displayedClients.length > 0 
    ? Math.round(displayedClients.reduce((sum, c) => sum + (c.score || 0), 0) / displayedClients.length)
    : 0;
  const gradeACount = displayedClients.filter(c => c.grade === "A").length;

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border">
        <div className="px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isFirm 
                ? "Unlimited Portfolio Management" 
                : `Automated Audit Capacity: ${clients.length}/10 clients`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* CID Filter Toggle */}
            {uploadedCIDs.length > 0 && (
              <Button
                variant={filterByUploadedCIDs ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterByUploadedCIDs(!filterByUploadedCIDs)}
                className={cn(
                  "gap-2",
                  filterByUploadedCIDs && "gradient-gold text-charcoal shadow-gold"
                )}
              >
                <Filter className="w-4 h-4" />
                {filterByUploadedCIDs ? "Showing Uploaded" : "Filter by Uploads"}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshClients} 
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {/* Capacity Warning for Solo users at limit */}
        {!isFirm && isAtLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Audit Capacity Reached</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your Solo Auditor plan supports up to 10 clients. Upgrade to Firm Scale for unlimited Portfolio Management.
                </p>
              </div>
              <Button 
                size="sm" 
                className="gradient-gold text-charcoal font-semibold shadow-gold"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                Upgrade Now
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="stat-value text-foreground">{totalClients}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {isFirm ? "Total Clients" : `of 10 Clients`}
                </p>
              </div>
            </div>
          </div>
          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="stat-value text-foreground">{avgScore}%</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg. Score</p>
              </div>
            </div>
          </div>
          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-500">A</span>
              </div>
              <div>
                <p className="stat-value text-foreground">{gradeACount}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Top Performers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading portfolio...</p>
            </div>
          </div>
        ) : error && clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshClients}>Try Again</Button>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-semibold mb-2">No Clients Yet</p>
            <p className="text-muted-foreground max-w-sm">Upload a financial report in the Audit Lab to create your first client audit.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated rounded-xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-muted/50 border-b border-border">
              <div className="col-span-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">M.A.P. Grade</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Audit</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {displayedClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center table-row-hover cursor-pointer group"
                  onClick={() => onClientSelect(client)}
                >
                  <div className="col-span-4">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{client.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">ID: {client.id}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">{client.industry}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {client.grade ? (
                      <span className={`badge-grade ${getGradeClass(client.grade)}`}>
                        {client.grade}
                        {client.score !== null && (
                          <span className="ml-1.5 opacity-75 font-normal">({client.score}%)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(client.lastAuditDate)}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Map
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {/* Hidden clients indicator for Solo users */}
              {hasHiddenClients && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4 bg-muted/30 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    +{clients.length - clientLimit} more clients hidden • 
                    <button 
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="ml-1 text-primary font-medium hover:underline"
                    >
                      Upgrade to Firm Scale
                    </button>
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)}
        clientCount={clients.length}
      />
    </div>
  );
};

export default ClientPortfolio;
