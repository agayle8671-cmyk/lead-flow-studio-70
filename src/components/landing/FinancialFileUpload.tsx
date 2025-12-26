import { useState, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://file-reader--agayle8671.replit.app";

export interface ParsedFinancialData {
  revenue?: number;
  costs?: number;
  customers?: number;
  avgOrderValue?: number;
  marketingSpend?: number;
  operationsCost?: number;
}

interface FileUploadProps {
  onDataParsed: (data: ParsedFinancialData) => void;
}

// Local fallback parsers
const parseCSV = (content: string): ParsedFinancialData => {
  const lines = content.trim().split(/\r?\n/);
  const data: ParsedFinancialData = {};

  for (const line of lines) {
    const parts = line.split(/[,\t;]/).map((p) => p.trim().toLowerCase());
    
    if (parts.length >= 2) {
      const key = parts[0];
      const value = parseFloat(parts[1].replace(/[$,]/g, ""));
      
      if (!isNaN(value)) {
        if (key.includes("revenue") || key.includes("income") || key.includes("sales")) {
          data.revenue = value;
        } else if (key.includes("cost") || key.includes("expense") || key.includes("spending")) {
          data.costs = value;
        } else if (key.includes("customer") || key.includes("client") || key.includes("user")) {
          data.customers = Math.round(value);
        } else if (key.includes("order") || key.includes("aov") || key.includes("average")) {
          data.avgOrderValue = value;
        }
      }
    }
  }

  return data;
};

const parseJSON = (content: string): ParsedFinancialData => {
  const json = JSON.parse(content);
  const data: ParsedFinancialData = {};

  const findValue = (obj: Record<string, unknown>, keys: string[]): number | undefined => {
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      if (keys.some((k) => lowerKey.includes(k))) {
        const val = obj[key];
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const parsed = parseFloat(val.replace(/[$,]/g, ""));
          if (!isNaN(parsed)) return parsed;
        }
      }
    }
    return undefined;
  };

  data.revenue = findValue(json, ["revenue", "income", "sales"]);
  data.costs = findValue(json, ["cost", "expense", "spending"]);
  data.customers = findValue(json, ["customer", "client", "user"]);
  data.avgOrderValue = findValue(json, ["order", "aov", "average"]);

  if (data.customers !== undefined) data.customers = Math.round(data.customers);

  return data;
};

const FinancialFileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const parseFileLocally = useCallback((file: File): Promise<ParsedFinancialData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read the file"));
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content || content.trim().length === 0) {
          reject(new Error("The file appears to be empty"));
          return;
        }
        try {
          const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
          const parsedData = extension === ".json" ? parseJSON(content) : parseCSV(content);
          resolve(parsedData);
        } catch {
          reject(new Error("Could not parse the file format"));
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsUploading(true);

    try {
      let parsedData: ParsedFinancialData = {};

      // Try API first, fall back to local parsing
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/api/parse-finances`, {
          method: "POST",
          body: formData,
          headers: {
            "Accept": "application/json",
          },
        });

        const contentType = response.headers.get("content-type") || "";
        
        if (response.ok && contentType.includes("application/json")) {
          const result = await response.json();
          parsedData = {
            revenue: result.revenue ? Number(result.revenue) : undefined,
            costs: result.operationsCost ? Number(result.operationsCost) : undefined,
            customers: result.customers ? Math.round(Number(result.customers)) : undefined,
            avgOrderValue: result.avgOrderValue ? Number(result.avgOrderValue) : undefined,
            marketingSpend: result.marketingSpend ? Number(result.marketingSpend) : undefined,
            operationsCost: result.operationsCost ? Number(result.operationsCost) : undefined,
          };
        } else {
          console.log("API unavailable, using local parsing");
          parsedData = await parseFileLocally(file);
        }
      } catch (apiError) {
        console.log("API error, falling back to local parsing:", apiError);
        parsedData = await parseFileLocally(file);
      }

      // Filter out undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(parsedData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanedData).length === 0) {
        toast({
          variant: "destructive",
          title: "No data found",
          description: "Could not extract financial data. Use format: 'revenue, 50000' per line.",
        });
        setIsUploading(false);
        return;
      }

      const fields = Object.keys(cleanedData).length;
      toast({
        title: "Data imported",
        description: `Extracted ${fields} field${fields > 1 ? "s" : ""} from your file.`,
      });

      onDataParsed(cleanedData);
    } catch (error) {
      console.error("File processing error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not process the file.",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onDataParsed, toast, parseFileLocally]);

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
