import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Dna, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(240,7%,6%)] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(226,100%,59%)/0.05] via-transparent to-[hsl(270,60%,55%)/0.05]" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[hsl(226,100%,59%)/0.08] blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(270,60%,55%)/0.08] blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center p-12"
      >
        {/* Animated DNA icon */}
        <motion.div
          className="mb-8 inline-block"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[hsl(226,100%,59%)/0.2] to-[hsl(270,60%,55%)/0.2] flex items-center justify-center border border-white/10">
            <Dna className="w-12 h-12 text-[hsl(226,100%,68%)]" />
          </div>
        </motion.div>
        
        {/* Error code */}
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-8xl font-bold mb-4 bg-gradient-to-r from-[hsl(226,100%,68%)] via-white to-[hsl(270,60%,65%)] bg-clip-text text-transparent"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl font-semibold text-white mb-2">
          DNA Sequence Not Found
        </h2>
        <p className="text-[hsl(220,10%,55%)] mb-8 max-w-md mx-auto">
          The financial genome you're looking for doesn't exist in our database. 
          Let's get you back to your runway analysis.
        </p>
        
        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-[hsl(226,100%,59%)/0.3] hover:border-[hsl(226,100%,59%)/0.6] text-[hsl(226,100%,68%)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[hsl(226,100%,59%)] to-[hsl(270,60%,55%)] hover:opacity-90 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to DNA Lab
          </Button>
        </div>
        
        {/* Attempted path */}
        <p className="mt-8 text-xs text-[hsl(220,10%,40%)] font-mono">
          Attempted: {location.pathname}
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
