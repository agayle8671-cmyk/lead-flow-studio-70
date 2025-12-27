import { motion } from "framer-motion";
import { Briefcase, ArrowRight, RefreshCw, Loader2, TrendingUp, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClient, Client } from "@/contexts/ClientContext";
import { format } from "date-fns";

interface ClientPortfolioProps {
  onClientSelect: (client: Client) => void;
}

const ClientPortfolio = ({ onClientSelect }: ClientPortfolioProps) => {
  const { clients, isLoading, error, refreshClients } = useClient();

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

  // Stats summary
  const totalClients = clients.length;
  const avgScore = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + (c.score || 0), 0) / clients.length)
    : 0;
  const gradeACount = clients.filter(c => c.grade === "A").length;

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border">
        <div className="px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage and audit your client accounts</p>
          </div>
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
      </header>

      {/* Content */}
      <main className="p-8">
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
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Clients</p>
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
              {clients.map((client, index) => (
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
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ClientPortfolio;
