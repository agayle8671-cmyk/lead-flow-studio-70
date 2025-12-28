import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface HealthCardData {
  runway_months: number;
  grade: string;
  monthly_burn: number;
  cash_on_hand: number;
  profit_margin: number;
  insight: string;
  revenue_trend?: number[];
  expense_trend?: number[];
}

// ═══════════════════════════════════════════════════════════════════════════
// INVESTOR DNA REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

interface SimulationScenario {
  optimistic: { runway: number; description: string };
  current: { runway: number; description: string };
  danger: { runway: number; description: string };
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getGradeEmoji(grade: string): string {
  const g = grade.toUpperCase();
  if (g === "A") return "🏆";
  if (g === "B") return "✅";
  if (g === "C") return "⚠️";
  return "🚨";
}

function getRunwayStatus(months: number): string {
  if (!isFinite(months)) return "Infinite";
  if (months >= 18) return "Healthy";
  if (months >= 12) return "Good";
  if (months >= 6) return "Caution";
  return "Critical";
}

function formatRunwayForExport(months: number): string {
  if (!isFinite(months)) return "∞ (Infinite)";
  if (isNaN(months)) return "N/A";
  return `${months.toFixed(1)} months`;
}

function formatBurnForExport(burn: number): string {
  if (burn === 0) return "Stagnant (Zero Burn)";
  if (burn < 0) return `Profitable (+${formatCurrency(Math.abs(burn))}/mo)`;
  return formatCurrency(burn);
}

/**
 * Generate a full Investor Update Report in Markdown format
 */
export function generateInvestorUpdate(data: HealthCardData, scenarios?: SimulationScenario): string {
  const today = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  const gradeEmoji = getGradeEmoji(data.grade);
  const status = getRunwayStatus(data.runway_months);
  
  // Calculate net burn
  const netBurn = data.monthly_burn;
  
  // Build the markdown report
  let report = `# 🧬 Runway DNA — Investor Update Report

**Generated:** ${today}  
**Powered by:** Runway DNA Intelligence Engine

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Status** | ${gradeEmoji} Grade ${data.grade.toUpperCase()} (${status}) |
| **Runway** | ${formatRunwayForExport(data.runway_months)} |
| **Monthly Burn** | ${formatBurnForExport(netBurn)} |
| **Cash on Hand** | ${formatCurrency(data.cash_on_hand)} |

> ${data.insight}

---

## Financial Health Breakdown

### 💰 Cash Position

- **Current Cash on Hand:** ${formatCurrency(data.cash_on_hand)}
- **Monthly Burn Rate:** ${formatBurnForExport(data.monthly_burn)}
- **Calculated Runway:** ${formatRunwayForExport(data.runway_months)}

### 📊 Profit Margin

- **Current Margin:** ${data.profit_margin.toFixed(1)}%
- **Margin Status:** ${data.profit_margin >= 20 ? "✅ Strong" : data.profit_margin >= 10 ? "⚠️ Moderate" : data.profit_margin >= 0 ? "🔶 Low" : "🚨 Negative"}

### 🏆 Health Grade: ${data.grade.toUpperCase()}

${data.grade.toUpperCase() === "A" 
  ? "Elite financial health. Top 12% of funded startups. Ready for aggressive growth or favorable fundraising terms." 
  : data.grade.toUpperCase() === "B" 
  ? "Strong financial position. Well-managed burn rate with healthy runway. Continue optimizing unit economics." 
  : data.grade.toUpperCase() === "C" 
  ? "Moderate health. Consider cost optimization or revenue acceleration. Begin fundraising conversations early." 
  : "Attention required. Take immediate action to extend runway through cost cuts or emergency funding."}

`;

  // Add Simulation Scenarios if provided
  if (scenarios) {
    report += `---

## Simulated Path Analysis

Based on our compound growth simulation engine:

### 🌟 Optimistic Scenario
- **Projected Runway:** ${scenarios.optimistic.runway >= 24 ? "24+ months" : `${scenarios.optimistic.runway.toFixed(1)} months`}
- **Assumptions:** ${scenarios.optimistic.description}

### 🎯 Current Path
- **Projected Runway:** ${scenarios.current.runway >= 24 ? "24+ months" : `${scenarios.current.runway.toFixed(1)} months`}
- **Assumptions:** ${scenarios.current.description}

### 🔥 Danger Zone
- **Projected Runway:** ${scenarios.danger.runway >= 24 ? "24+ months" : `${scenarios.danger.runway.toFixed(1)} months`}
- **Assumptions:** ${scenarios.danger.description}

`;
  }

  report += `---

## Next Steps & Recommendations

${!isFinite(data.runway_months) || data.runway_months >= 36
  ? `1. **Capitalize on Strength:** With infinite/extended runway, pursue aggressive growth strategies.
2. **Strategic Investment:** Consider R&D investments, market expansion, or strategic acquisitions.
3. **Build Moats:** Invest in competitive advantages while capital position is strong.`
  : data.runway_months >= 18 
  ? `1. **Focus on Growth:** With healthy runway, prioritize customer acquisition and market expansion.
2. **Build for Scale:** Invest in infrastructure and team that supports 2-3x growth.
3. **Prepare for Fundraising:** Start building relationships with VCs for future rounds.` 
  : data.runway_months >= 12 
  ? `1. **Begin Fundraising:** Start investor conversations now to close before runway drops below 6 months.
2. **Optimize Burn:** Review expenses for potential 10-20% reduction opportunities.
3. **Accelerate Revenue:** Double down on highest-converting channels.` 
  : data.runway_months >= 6 
  ? `1. **Urgent: Extend Runway:** Implement immediate cost reduction measures.
2. **Fast-Track Fundraising:** Prioritize term sheet negotiations with interested investors.
3. **Bridge Options:** Explore bridge financing or revenue-based financing.`
  : `1. **Emergency Mode:** Cut all non-essential expenses immediately.
2. **Survival Focus:** Consider pivots, acqui-hires, or emergency financing.
3. **Transparency:** Communicate situation clearly with team and stakeholders.`}

---

*This report was generated by Runway DNA — Your startup's financial intelligence platform.*

`;

  return report;
}

/**
 * Generate a condensed, emoji-rich Slack-friendly update
 */
export function generateSlackUpdate(data: HealthCardData): string {
  const gradeEmoji = getGradeEmoji(data.grade);
  const status = getRunwayStatus(data.runway_months);
  const runwayDisplay = !isFinite(data.runway_months) ? "∞" : data.runway_months.toFixed(1);
  const burnDisplay = data.monthly_burn === 0 ? "Stagnant" : `${formatCurrency(data.monthly_burn)}/mo`;
  const statusEmoji = !isFinite(data.runway_months) || data.runway_months >= 12 ? "✅" : data.runway_months >= 6 ? "⚠️" : "🚨";
  
  return `🧬 *Runway DNA Update*

${gradeEmoji} *Grade ${data.grade.toUpperCase()}* | ⏱️ *${runwayDisplay} Months Left*

💰 Cash: ${formatCurrency(data.cash_on_hand)}
🔥 Burn: ${burnDisplay}
📈 Margin: ${data.profit_margin.toFixed(1)}%

_Status: ${status}_ ${statusEmoji}`;
}

/**
 * Generate ultra-condensed one-liner for quick sharing
 */
export function generateQuickStatus(data: HealthCardData): string {
  const gradeEmoji = getGradeEmoji(data.grade);
  const runwayDisplay = !isFinite(data.runway_months) ? "∞" : data.runway_months.toFixed(1);
  return `🧬 Runway DNA: ${gradeEmoji} Grade ${data.grade.toUpperCase()} | ${runwayDisplay} Months Left | ${formatCurrency(data.cash_on_hand)} Cash`;
}

/**
 * Download content as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string = "text/markdown"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

export async function exportAsPNG(elementId: string, filename: string = "health-card.png"): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found");
  }

  const canvas = await html2canvas(element, {
    backgroundColor: "#0D0D0E",
    scale: 2,
    logging: false,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function exportAsPDF(elementId: string, filename: string = "health-card.pdf"): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found");
  }

  const canvas = await html2canvas(element, {
    backgroundColor: "#0D0D0E",
    scale: 2,
    logging: false,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

export function shareToTwitter(data: HealthCardData): void {
  const runwayDisplay = !isFinite(data.runway_months) ? "Infinite ∞" : `${data.runway_months.toFixed(1)} months`;
  const burnDisplay = data.monthly_burn === 0 ? "Zero Burn 🎯" : `$${data.monthly_burn.toLocaleString()}`;
  
  const text = `🧬 Just decoded my startup's Financial DNA with @RunwayDNA!

📊 Runway: ${runwayDisplay}
🏆 Health Grade: ${data.grade}
💰 Monthly Burn: ${burnDisplay}

${data.insight}

#StartupLife #FounderLife #FinancialHealth`;

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "width=600,height=400");
}
