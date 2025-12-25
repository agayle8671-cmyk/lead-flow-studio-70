import { useState, useCallback, useEffect } from "react";
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

type AppState = "landing" | "calculator" | "analyzing" | "teaser" | "dashboard";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("");

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
    setAppState("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setAppState("teaser");
  }, []);

  const handleUnlock = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleLeadSubmit = useCallback((data: { name: string; email: string }) => {
    setUserName(data.name);
    setIsModalOpen(false);
    setAppState("dashboard");
  }, []);

  // Dashboard view
  if (appState === "dashboard" && calculatorData) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar userName={userName} />
        <DashboardContent data={calculatorData} userName={userName} />
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
        <ProfitCalculator onSubmit={handleCalculatorSubmit} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
