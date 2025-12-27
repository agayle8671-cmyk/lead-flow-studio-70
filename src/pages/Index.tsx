import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import ProfitCalculator, { CalculatorData } from "@/components/landing/ProfitCalculator";
import AnalyzingState from "@/components/landing/AnalyzingState";
import TeaserReport from "@/components/landing/TeaserReport";
import FoundersPricingBanner from "@/components/landing/FoundersPricingBanner";
import LeadCaptureModal from "@/components/landing/LeadCaptureModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useToast } from "@/hooks/use-toast";
import type { ParsedFinancialData } from "@/components/landing/FinancialFileUpload";
import { apiUrl } from "@/lib/config";

type AppState = "landing" | "calculator" | "analyzing" | "teaser" | "dashboard";

const MINIMUM_ANALYZING_TIME = 2000; // 2 seconds minimum for smooth UX

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<{ marketingSpend: number; operationsCost: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [healthRefreshTrigger, setHealthRefreshTrigger] = useState(0);
  const analysisStartTime = useRef<number>(0);
  const { toast } = useToast();

  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleGetStarted = useCallback(() => {
    setAppState("calculator");
    // Smooth scroll to calculator
    setTimeout(() => {
      document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleCalculatorSubmit = useCallback((data: CalculatorData) => {
    setCalculatorData(data);
    // For manual entry, treat all costs as operations costs
    setCostBreakdown({ marketingSpend: 0, operationsCost: data.costs });
    setAppState("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFileUploadSuccess = useCallback((data: ParsedFinancialData) => {
    const marketingSpend = Number(data.marketingSpend ?? 0);
    const operationsCost = Number(data.operationsCost ?? 0);
    const totalCosts = Number(data.costs ?? (marketingSpend + operationsCost));

    setCostBreakdown({ marketingSpend, operationsCost });

    // Convert parsed data to CalculatorData format
    const calcData: CalculatorData = {
      revenue: Number(data.revenue ?? 0),
      costs: totalCosts,
      customers: Number(data.customers ?? 0),
      avgOrderValue: Number(data.avgOrderValue ?? 0),
    };

    // Persist to backend immediately when a file is parsed
    void (async () => {
      try {
        const payload = {
          revenue: String(calcData.revenue),
          marketingSpend: String(marketingSpend),
          operationsCost: String(operationsCost),
        };

        const endpoint = apiUrl("/api/save");
        console.log("Auto-saving parsed report to:", endpoint, payload);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          mode: "cors",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Save failed: ${res.status} ${text}`);
        }

        console.log("Auto-save succeeded");
        // Trigger health score refresh after successful save
        setHealthRefreshTrigger((prev) => prev + 1);
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    })();

    setCalculatorData(calcData);
    analysisStartTime.current = Date.now();
    setAppState("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    // Ensure minimum 2 second delay for smooth UX
    const elapsed = Date.now() - analysisStartTime.current;
    const remainingTime = Math.max(0, MINIMUM_ANALYZING_TIME - elapsed);
    
    setTimeout(() => {
      setAppState("teaser");
    }, remainingTime);
  }, []);

  const handleUnlock = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleLeadSubmit = useCallback((data: { name: string; email: string }) => {
    setUserName(data.name);
    setIsModalOpen(false);
    setAppState("dashboard");
  }, []);

  const handleSaveReport = useCallback(async () => {
    if (!calculatorData) return;

    const breakdown = costBreakdown ?? { marketingSpend: 0, operationsCost: calculatorData.costs };

    try {
      const response = await fetch(apiUrl("/api/save"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          revenue: String(calculatorData.revenue),
          marketingSpend: String(breakdown.marketingSpend),
          operationsCost: String(breakdown.operationsCost),
        }),
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Failed to save report");
      }

      toast({
        title: "Report saved",
        description: "Your financial report has been saved successfully.",
      });
      // Trigger health score refresh after manual save
      setHealthRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save the report. Please try again.",
      });
    }
  }, [calculatorData, costBreakdown, toast]);

  // Dashboard view
  if (appState === "dashboard" && calculatorData) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar userName={userName} />
        <DashboardContent data={calculatorData} userName={userName} onSaveReport={handleSaveReport} refreshHealthTrigger={healthRefreshTrigger} />
      </div>
    );
  }

  // Analyzing state
  if (appState === "analyzing") {
    return (
      <div className="min-h-screen bg-background">
        <AnalyzingState onComplete={handleAnalysisComplete} />
      </div>
    );
  }

  // Teaser report
  if (appState === "teaser" && calculatorData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <TeaserReport data={calculatorData} onUnlock={handleUnlock} />
        </div>
        <Footer />
        <LeadCaptureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleLeadSubmit}
        />
      </div>
    );
  }

  // Landing page (default)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <FeatureGrid />
        <FoundersPricingBanner />
        <ProfitCalculator onSubmit={handleCalculatorSubmit} onFileUploadSuccess={handleFileUploadSuccess} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
