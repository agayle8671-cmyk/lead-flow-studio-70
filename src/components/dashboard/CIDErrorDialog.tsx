import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen } from "lucide-react";

interface CIDErrorDialogProps {
  open: boolean;
  onClose: () => void;
}

const CIDErrorDialog = ({ open, onClose }: CIDErrorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-gradient-to-b from-primary/5 to-background">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-gold mb-4">
            <AlertTriangle className="w-7 h-7 text-charcoal" />
          </div>
          <DialogTitle className="text-xl font-bold text-primary">
            Audit Failed: Missing CID
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2 leading-relaxed">
            The uploaded document could not be processed because a valid Client ID (CID) was not found or recognized.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground font-medium mb-2">How to fix this:</p>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Ensure the client is registered in your Portfolio
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Select the correct client before uploading
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              Refer to the Master User Guide for CID requirements
            </li>
          </ul>
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            className="flex-1 gradient-gold text-charcoal font-semibold shadow-gold hover:shadow-lg"
            onClick={() => {
              window.open("/resource-centre", "_blank");
              onClose();
            }}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CIDErrorDialog;
