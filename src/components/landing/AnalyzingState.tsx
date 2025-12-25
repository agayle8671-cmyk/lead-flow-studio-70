import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const analysisSteps = [
  "Analyzing revenue streams...",
  "Calculating profit margins...",
  "Evaluating customer metrics...",
  "Generating recommendations...",
  "Preparing your report...",
];

interface AnalyzingStateProps {
  onComplete: () => void;
}

const AnalyzingState = ({ onComplete }: AnalyzingStateProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(stepInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-20">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Animated circle */}
          <div className="relative w-40 h-40 mx-auto mb-10">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
            
            {/* Spinning ring */}
            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "3s" }}>
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="110 330"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.span
                  key={progress}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold gradient-text"
                >
                  {progress}%
                </motion.span>
              </div>
            </div>
          </div>

          {/* Status text */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl md:text-3xl font-bold mb-6"
          >
            Analyzing Your Business
          </motion.h2>

          {/* Steps */}
          <div className="space-y-3 mb-8">
            {analysisSteps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-center justify-center gap-3 text-sm ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : index === currentStep ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border" />
                )}
                <span>{step}</span>
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: "var(--gradient-primary)",
                width: `${progress}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnalyzingState;
