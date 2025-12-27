import { motion } from "framer-motion";
import { Archive, FileText, Calendar } from "lucide-react";
import { forwardRef } from "react";

const AuditArchive = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-5">
          <h1 className="text-xl font-bold tracking-tight">Audit Archive</h1>
          <p className="text-sm text-muted-foreground">Historical audit records and document repository</p>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[60vh] text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Archive className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Archive Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Access historical audit reports, track changes over time, and maintain compliance documentation.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="p-4 rounded-lg border border-border bg-card text-left">
              <FileText className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Document Storage</p>
              <p className="text-xs text-muted-foreground">Secure cloud archive</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card text-left">
              <Calendar className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Timeline View</p>
              <p className="text-xs text-muted-foreground">Historical trends</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
});

AuditArchive.displayName = "AuditArchive";

export default AuditArchive;
