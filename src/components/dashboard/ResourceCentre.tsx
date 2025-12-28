import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BookOpen, 
  FileSpreadsheet, 
  FlaskConical,
  FileText,
  Map,
  Download,
  Lock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/contexts/PlanContext";

interface ResourceCentreProps {
  onBack: () => void;
}

interface ResourceCard {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  downloadUrl: string;
  proOnly?: boolean;
}

const protocolResources: ResourceCard[] = [
  {
    id: "user-guide",
    icon: BookOpen,
    title: "Master User Guide",
    description: "Learn the M.A.P. Header Protocol and CID Tagging system for seamless audit workflows.",
    downloadUrl: "https://finance-core-agayle8671.replit.app/assets/master_user_guide_1766883983983.pdf",
  },
  {
    id: "excel-template",
    icon: FileSpreadsheet,
    title: "M.A.P. Excel Template",
    description: "Pre-formatted sheet with CID headers for 100% upload success rate.",
    downloadUrl: "https://finance-core-agayle8671.replit.app/assets/map_excel_template_guide_1766883983983.pdf",
  },
  {
    id: "lab-manual",
    icon: FlaskConical,
    title: "The Audit Lab Manual",
    description: "A 60-second technical breakdown of the M.A.P. engine and audit algorithms.",
    downloadUrl: "https://finance-core-agayle8671.replit.app/assets/audit_lab_manual_1766883983985.pdf",
  },
];

const clientToolkitResources: ResourceCard[] = [
  {
    id: "health-grade",
    icon: FileText,
    title: "Health Grade One-Pager",
    description: "Help your clients understand their A-F Grade and what it means for their business.",
    downloadUrl: "https://finance-core-agayle8671.replit.app/assets/health_grade_one_pager_1766883983982.pdf",
    proOnly: true,
  },
  {
    id: "route-explainer",
    icon: Map,
    title: "Projected Route Explainer",
    description: "A visual guide to the 90-day trajectory map and profit optimization path.",
    downloadUrl: "https://finance-core-agayle8671.replit.app/assets/projected_route_explainer_1766883983984.pdf",
    proOnly: true,
  },
];

const ResourceCentre = ({ onBack }: ResourceCentreProps) => {
  const { isFirm } = usePlan();

  const handleDownload = (resource: ResourceCard) => {
    if (resource.proOnly && !isFirm) return;
    
    // Simulate download - in production, this would trigger actual file download
    window.open(resource.downloadUrl, "_blank");
  };

  const ResourceCardComponent = ({ resource, index }: { resource: ResourceCard; index: number }) => {
    const isLocked = resource.proOnly && !isFirm;
    const Icon = resource.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-elevated group ${
          isLocked ? "opacity-75" : "hover:border-primary/30"
        }`}>
          {/* Pro Only Badge */}
          {resource.proOnly && (
            <div className="absolute top-3 right-3 z-10">
              <Badge 
                variant="outline" 
                className={`${
                  isFirm 
                    ? "border-primary/30 text-primary bg-primary/5" 
                    : "border-muted-foreground/30 text-muted-foreground bg-muted/50"
                }`}
              >
                {isFirm ? (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Firm Scale
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Firm Only
                  </>
                )}
              </Badge>
            </div>
          )}

          <CardContent className="p-6">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
              isLocked 
                ? "bg-muted" 
                : "gradient-gold shadow-gold group-hover:scale-105"
            }`}>
              <Icon className={`w-6 h-6 ${isLocked ? "text-muted-foreground" : "text-charcoal"}`} />
            </div>

            {/* Content */}
            <h3 className="font-semibold text-lg text-foreground mb-2">{resource.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {resource.description}
            </p>

            {/* Download Button */}
            <Button
              onClick={() => handleDownload(resource)}
              disabled={isLocked}
              className={`w-full ${
                isLocked 
                  ? "bg-muted text-muted-foreground cursor-not-allowed" 
                  : "gradient-gold text-charcoal font-semibold shadow-gold hover:shadow-lg"
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Upgrade to Access
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shadow-gold">
              <BookOpen className="w-7 h-7 text-charcoal" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Resource Centre</h1>
              <p className="text-muted-foreground mt-1">
                Enterprise documentation and client communication tools
              </p>
            </div>
          </div>
        </motion.div>

        {/* Protocol Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full gradient-gold" />
            <h2 className="text-xl font-semibold text-foreground">The Protocol</h2>
            <span className="text-sm text-muted-foreground">— Core M.A.P. Documentation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {protocolResources.map((resource, index) => (
              <ResourceCardComponent key={resource.id} resource={resource} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Client Toolkit Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full gradient-gold" />
            <h2 className="text-xl font-semibold text-foreground">Client Toolkit</h2>
            <span className="text-sm text-muted-foreground">— Client Communication Assets</span>
            {!isFirm && (
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary bg-primary/5">
                Firm Scale Required
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clientToolkitResources.map((resource, index) => (
              <ResourceCardComponent key={resource.id} resource={resource} index={index + 3} />
            ))}
          </div>
        </motion.section>

        {/* Upgrade CTA for Solo users */}
        {!isFirm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 rounded-2xl border-glow text-center"
            style={{
              background: "linear-gradient(145deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.02))",
            }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Unlock the Complete Resource Library
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Upgrade to Firm Scale to access client-ready communication materials and advanced documentation.
            </p>
            <Button 
              className="gradient-gold text-charcoal font-semibold shadow-gold hover:shadow-lg"
              onClick={onBack}
            >
              View Firm Scale Plans
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default ResourceCentre;
