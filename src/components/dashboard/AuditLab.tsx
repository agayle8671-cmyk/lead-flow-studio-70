import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, FileText, CheckCircle, Briefcase, FileUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useClient, Client } from "@/contexts/ClientContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditLabProps {
  onAuditComplete: (client: Client) => void;
}

const AuditLab = ({ onAuditComplete }: AuditLabProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();
  const { clients, refreshClients, addUploadedCID } = useClient();

  const processFile = useCallback(async (file: File) => {
    if (!selectedClientId) {
      toast({
        variant: "destructive",
        title: "Client Required",
        description: "Please select a client before uploading a document.",
      });
      return;
    }

    setIsUploading(true);
    setProcessingStatus("Uploading document...");
    setUploadSuccess(false);

    try {
      // Read file content
      const content = await file.text();
      
      setProcessingStatus("Analyzing with AI...");
      
      // Send to live backend at marginauditpro.com
      const response = await fetch("https://marginauditpro.com/api/parse-finances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ content, clientId: selectedClientId }),
        mode: "cors",
      });

      const responseText = await response.text();
      
      // Check for Missing CID error - show Compass Gold toast
      if (!response.ok) {
        if (responseText.toLowerCase().includes("missing cid") || 
            responseText.toLowerCase().includes("missing client") ||
            responseText.toLowerCase().includes("invalid cid")) {
          toast({
            title: "Audit Failed: Missing CID Header",
            description: "Refer to the Master User Guide.",
            className: "bg-gradient-to-r from-amber-500 to-yellow-600 text-charcoal border-none shadow-lg",
          });
          throw new Error("Missing CID");
        }
        throw new Error(`Parse failed: ${response.status} - ${responseText}`);
      }

      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {};
      }

      setUploadSuccess(true);
      setProcessingStatus("Audit complete!");
      
      // Track the uploaded CID for portfolio filtering
      addUploadedCID(selectedClientId);
      
      toast({
        title: "Audit Processed",
        description: "Financial data has been extracted and saved.",
      });

      const selected = clients.find((c) => c.id === parseInt(selectedClientId));
      
      // Refresh clients to update dashboard data
      await refreshClients();

      if (selected) {
        setTimeout(() => onAuditComplete(selected), 1500);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not process the document.";
      
      // Don't show additional toast for CID errors (already shown above)
      if (!errorMessage.includes("Missing CID")) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: errorMessage,
        });
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setProcessingStatus("");
        setUploadSuccess(false);
      }, 2000);
    }
  }, [selectedClientId, clients, toast, refreshClients, onAuditComplete, addUploadedCID]);

  const validateAndProcessFile = useCallback((file: File) => {
    const validTypes = [".csv", ".txt", ".json", ".pdf"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Please upload a CSV, TXT, JSON, or PDF file.`,
      });
      return;
    }

    const maxSize = fileExtension === ".pdf" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum size: ${fileExtension === ".pdf" ? "10MB" : "5MB"}.`,
      });
      return;
    }

    processFile(file);
  }, [processFile, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border">
        <div className="px-8 py-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Lab</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upload financial documents for AI-powered margin analysis</p>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Step 1: Client Selection */}
          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shadow-gold shrink-0">
                <span className="text-charcoal font-bold">1</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Select Client</h2>
                <p className="text-sm text-muted-foreground">Choose which client this audit belongs to</p>
              </div>
            </div>

            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{client.name}</span>
                      <span className="text-muted-foreground">— {client.industry}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {clients.length === 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                No clients found. Contact support to add clients.
              </p>
            )}
          </div>

          {/* Step 2: Document Upload */}
          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all",
                selectedClientId ? "gradient-gold shadow-gold" : "bg-muted"
              )}>
                <span className={selectedClientId ? "text-charcoal font-bold" : "text-muted-foreground font-bold"}>2</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Upload Document</h2>
                <p className="text-sm text-muted-foreground">Drop financial statements for AI analysis</p>
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
                !selectedClientId && "opacity-40 pointer-events-none",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv,.txt,.json,.pdf"
                disabled={!selectedClientId}
              />
              <label htmlFor="file-upload" className={cn("cursor-pointer flex flex-col items-center gap-5", !selectedClientId && "cursor-not-allowed")}>
                {isUploading ? (
                  <>
                    {uploadSuccess ? (
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-foreground">{processingStatus || "Processing..."}</p>
                      <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                      isDragging ? "bg-primary/10" : "bg-muted"
                    )}>
                      <FileUp className={cn("w-8 h-8 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, CSV, TXT, or JSON files up to 10MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI-powered financial parsing</span>
                    </div>
                  </>
                )}
              </label>

              {/* Decorative gradient */}
              <div className="absolute inset-0 rounded-xl opacity-50 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/3 rounded-full blur-3xl" />
              </div>
            </div>

            {!selectedClientId && (
              <p className="text-sm text-primary mt-4 text-center font-medium">
                ↑ Select a client above to enable uploads
              </p>
            )}
          </div>
        </motion.div>
      </main>

    </div>
  );
};

export default AuditLab;
