import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface PredictiveAlertProps {
  warning: string;
}

export default function PredictiveAlert({ warning }: PredictiveAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
    >
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-destructive text-sm">Predictive Alert</h4>
        <p className="text-sm text-foreground/80 mt-1">{warning}</p>
      </div>
    </motion.div>
  );
}
