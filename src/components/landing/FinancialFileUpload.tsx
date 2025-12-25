import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onDataParsed: (data: Record<string, unknown>) => void;
}

const FinancialFileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate reading the file (this is where your Replit logic goes)
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
  };

  return (
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center bg-card/50">
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
          <Upload className="w-12 h-12 text-primary" />
        )}
        <span className="text-lg font-medium">
          {isUploading ? "Reading financial data..." : "Upload expenses (CSV or TXT)"}
        </span>
        <span className="text-sm text-muted-foreground">
          Let our AI File-Reader populate the calculator for you
        </span>
      </label>
    </div>
  );
};

export default FinancialFileUpload;
