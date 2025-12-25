import { useState, useCallback } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onDataParsed: (data: Record<string, unknown>) => void;
}

const FinancialFileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      console.log("File content read:", event.target?.result);
      // In a real app, you'd send this to your Replit backend here
      setTimeout(() => {
        setIsUploading(false);
        onDataParsed({ /* mock parsed data */ });
      }, 1500);
    };
    reader.readAsText(file);
  }, [onDataParsed]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
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

    // Validate file type
    const validTypes = [".csv", ".txt", ".json"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!validTypes.includes(fileExtension)) {
      console.warn("Invalid file type:", fileExtension);
      return;
    }

    processFile(file);
  }, [processFile]);

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
