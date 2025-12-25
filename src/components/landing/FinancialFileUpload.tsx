import { useState, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onDataParsed: (data: Record<string, unknown>) => void;
}

interface ParsedFinancialData {
  revenue?: number;
  costs?: number;
  customers?: number;
  avgOrderValue?: number;
}

const parseCSV = (content: string): ParsedFinancialData => {
  const lines = content.trim().split(/\r?\n/);
  const data: ParsedFinancialData = {};

  // Try to detect if it's a header-value format or key-value format
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

  // Handle both flat and nested structures
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

  const processFile = useCallback((file: File) => {
    setIsUploading(true);

    const reader = new FileReader();
    
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not read the file. Please try again.",
      });
    };

    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      if (!content || content.trim().length === 0) {
        setIsUploading(false);
        toast({
          variant: "destructive",
          title: "Empty file",
          description: "The file appears to be empty. Please upload a file with data.",
        });
        return;
      }

      try {
        let parsedData: ParsedFinancialData = {};
        const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

        if (extension === ".json") {
          parsedData = parseJSON(content);
        } else {
          // CSV or TXT
          parsedData = parseCSV(content);
        }

        const hasData = Object.keys(parsedData).length > 0;

        if (!hasData) {
          toast({
            variant: "destructive",
            title: "No data found",
            description: "Could not find financial data in the file. Please check the format.",
          });
          setIsUploading(false);
          return;
        }

        // Show success with what was found
        const fields = Object.keys(parsedData).length;
        toast({
          title: "Data imported",
          description: `Successfully extracted ${fields} field${fields > 1 ? "s" : ""} from your file.`,
        });

        onDataParsed(parsedData as Record<string, unknown>);
      } catch {
        toast({
          variant: "destructive",
          title: "Parse error",
          description: "Could not parse the file. Please check the format.",
        });
      }
      
      setIsUploading(false);
    };

    reader.readAsText(file);
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
          <CheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
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
