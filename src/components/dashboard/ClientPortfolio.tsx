import { motion } from "framer-motion";
import { Briefcase, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClient, Client } from "@/contexts/ClientContext";
import { format } from "date-fns";

const gradeStyles: Record<string, string> = {
  A: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  B: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  C: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  F: "bg-red-500/10 text-red-400 border-red-500/30",
};

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

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Client Portfolio</h1>
            <p className="text-sm text-muted-foreground">Manage and audit your client accounts</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshClients} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error && clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshClients}>Try Again</Button>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Clients Yet</p>
            <p className="text-muted-foreground">Upload a financial report to create your first client audit.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-4">Client Name</div>
              <div className="col-span-2">Industry</div>
              <div className="col-span-2 text-center">M.A.P. Grade</div>
              <div className="col-span-2">Last Audit</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors"
                >
                  <div className="col-span-4">
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {client.id}</p>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {client.industry}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {client.grade ? (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${gradeStyles[client.grade] || gradeStyles.F}`}>
                        {client.grade}
                        {client.score !== null && (
                          <span className="ml-1.5 font-normal opacity-80">({client.score}%)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {formatDate(client.lastAuditDate)}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onClientSelect(client)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      View Map
                      <ArrowRight className="w-4 h-4 ml-1" />
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
