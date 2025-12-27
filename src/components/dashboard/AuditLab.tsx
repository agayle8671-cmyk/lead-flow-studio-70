import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, FileText, CheckCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useClient, Client } from "@/contexts/ClientContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiUrl } from "@/lib/config";

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
  const { clients, refreshClients } = useClient();

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
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      const isPDF = extension === ".pdf";

      if (isPDF) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", selectedClientId);

        const response = await fetch(apiUrl("/api/upload"), {
          method: "POST",
          body: formData,
          mode: "cors",
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        setProcessingStatus("Analyzing with AI...");
        await response.json();
      } else {
        const content = await file.text();
        
        const response = await fetch(apiUrl("/api/parse-finances"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ content, clientId: selectedClientId }),
          mode: "cors",
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`Parse failed: ${response.status} - ${errorText}`);
        }

        await response.json();
      }

      setUploadSuccess(true);
      setProcessingStatus("Audit complete!");
      
      toast({
        title: "Audit Processed",
        description: "Financial data has been extracted and saved.",
      });

      await refreshClients();
      
      const client = clients.find(c => c.id === parseInt(selectedClientId));
      if (client) {
        setTimeout(() => onAuditComplete(client), 1500);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Could not process the document.",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setProcessingStatus("");
        setUploadSuccess(false);
      }, 2000);
    }
  }, [selectedClientId, clients, toast, refreshClients, onAuditComplete]);

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
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-5">
          <h1 className="text-xl font-bold tracking-tight">Audit Lab</h1>
          <p className="text-sm text-muted-foreground">Upload financial documents for AI-powered analysis</p>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Client Selection */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Step 1: Select Client</h2>
                <p className="text-sm text-muted-foreground">Choose which client this document belongs to</p>
              </div>
            </div>

            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name} — {client.industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {clients.length === 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                No clients found. Upload a document to create the first client record.
              </p>
            )}
          </div>

          {/* Intake Zone */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Step 2: Intake Zone</h2>
                <p className="text-sm text-muted-foreground">Upload financial statements for AI analysis</p>
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200",
                !selectedClientId && "opacity-50 pointer-events-none",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-secondary/30"
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
              <label htmlFor="file-upload" className={cn("cursor-pointer flex flex-col items-center gap-4", !selectedClientId && "cursor-not-allowed")}>
                {isUploading ? (
                  <>
                    {uploadSuccess ? (
                      <CheckCircle className="w-14 h-14 text-primary" />
                    ) : (
                      <Loader2 className="w-14 h-14 text-primary animate-spin" />
                    )}
                    <span className="text-lg font-medium">{processingStatus || "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Upload className={cn("w-12 h-12", isDragging ? "text-primary" : "text-muted-foreground")} />
                      <FileText className={cn("w-10 h-10", isDragging ? "text-primary" : "text-muted-foreground/60")} />
                    </div>
                    <div>
                      <span className="text-lg font-medium">
                        {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, CSV, TXT, or JSON • AI-powered parsing
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {!selectedClientId && (
              <p className="text-sm text-amber-500 mt-3 text-center">
                Please select a client above before uploading
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AuditLab;
