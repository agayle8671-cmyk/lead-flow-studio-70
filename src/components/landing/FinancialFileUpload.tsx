import { useState, useCallback } from "react";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://4c2918a7-f869-42f0-b654-23db3bfab25d-00-6l8spb3ufyqa.spock.replit.dev";

interface FileUploadProps {
  onDataParsed: (data: Record<string, unknown>) => void;
}

interface ParsedFinancialData {
  revenue?: number;
  costs?: number;
  customers?: number;
  avgOrderValue?: number;
}

const FinancialFileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    setIsUploading(true);

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", file);

      // Send to API for AI-powered parsing
      const response = await fetch(`${API_BASE_URL}/api/parse`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      // Map API response to expected format
      const parsedData: ParsedFinancialData = {
        revenue: result.revenue ? Number(result.revenue) : undefined,
        costs: result.costs ? Number(result.costs) : undefined,
        customers: result.customers ? Math.round(Number(result.customers)) : undefined,
        avgOrderValue: result.avgOrderValue ? Number(result.avgOrderValue) : undefined,
      };

      // Filter out undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(parsedData).filter(([_, v]) => v !== undefined)
      );

      const hasData = Object.keys(cleanedData).length > 0;

      if (!hasData) {
        toast({
          variant: "destructive",
          title: "No data found",
          description: "Could not extract financial data from the file. Please check the format.",
        });
        setIsUploading(false);
        return;
      }

      // Show success with what was found
      const fields = Object.keys(cleanedData).length;
      toast({
        title: "Data imported",
        description: `AI extracted ${fields} field${fields > 1 ? "s" : ""} from your file.`,
      });

      onDataParsed(cleanedData);
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not process the file. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onDataParsed, toast]);

  const validateAndProcessFile = useCallback((file: File) => {
    const validTypes = [".csv", ".txt", ".json"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Please upload a CSV, TXT, or JSON file. Got: ${fileExtension}`,
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
      });
      return;
    }

    processFile(file);
  }, [processFile, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndProcessFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    validateAndProcessFile(file);
  }, [validateAndProcessFile]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-primary/30 bg-card/50 hover:border-primary/50 hover:bg-card/70"
      )}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept=".csv,.txt,.json"
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
        {isUploading ? (
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        ) : (
          <Upload className={cn(
            "w-12 h-12 transition-transform duration-200",
            isDragging ? "text-primary scale-110" : "text-primary"
          )} />
        )}
        <span className="text-lg font-medium">
          {isUploading
            ? "Reading financial data..."
            : isDragging
            ? "Drop your file here"
            : "Drag & drop or click to upload"}
        </span>
        <span className="text-sm text-muted-foreground">
          CSV, TXT, or JSON • Let our AI auto-fill the calculator
        </span>
      </label>
    </div>
  );
};

export default FinancialFileUpload;
