import { useState, useEffect } from "react";
import AppSidebar from "@/components/dashboard/AppSidebar";
import ClientPortfolio from "@/components/dashboard/ClientPortfolio";
import AuditLab from "@/components/dashboard/AuditLab";
import AuditArchive from "@/components/dashboard/AuditArchive";
import AuditDetail from "@/components/dashboard/AuditDetail";
import FirmSettings from "@/components/dashboard/FirmSettings";
import FirmLicensing from "@/components/dashboard/FirmLicensing";
import ResourceCentre from "@/components/dashboard/ResourceCentre";
import { Client } from "@/contexts/ClientContext";

type NavItem = "portfolio" | "lab" | "archive" | "settings" | "licensing" | "resources";
type ViewMode = "list" | "detail";

const Index = () => {
  const [activeNav, setActiveNav] = useState<NavItem>("portfolio");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setViewMode("detail");
  };

  const handleBackToPortfolio = () => {
    setViewMode("list");
    setSelectedClient(null);
    setActiveNav("portfolio");
  };

  const handleAuditComplete = (client: Client) => {
    setSelectedClient(client);
    setViewMode("detail");
    setActiveNav("portfolio");
  };

  const handleNavChange = (item: NavItem) => {
    setActiveNav(item);
    if (item !== "portfolio") {
      setViewMode("list");
      setSelectedClient(null);
    }
  };

  const renderContent = () => {
    // If viewing a client detail
    if (viewMode === "detail" && selectedClient) {
      return <AuditDetail client={selectedClient} onBack={handleBackToPortfolio} />;
    }

    // Otherwise render based on nav
    switch (activeNav) {
      case "portfolio":
        return <ClientPortfolio onClientSelect={handleClientSelect} />;
      case "lab":
        return <AuditLab onAuditComplete={handleAuditComplete} />;
      case "archive":
        return <AuditArchive />;
      case "settings":
        return <FirmSettings />;
      case "licensing":
        return <FirmLicensing onBack={() => setActiveNav("portfolio")} />;
      case "resources":
        return <ResourceCentre onBack={() => setActiveNav("portfolio")} />;
      default:
        return <ClientPortfolio onClientSelect={handleClientSelect} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar activeNav={activeNav} onNavChange={handleNavChange} />
      {renderContent()}
    </div>
  );
};

export default Index;
