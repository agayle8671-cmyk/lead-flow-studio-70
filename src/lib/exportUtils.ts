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

// ═══════════════════════════════════════════════════════════════════════════
// STRATEGIC INVESTOR REPORT EXPORT
// Compiles simulation snapshot data into structured reports
// ═══════════════════════════════════════════════════════════════════════════

export interface StrategicReportData {
  // DNA Grade
  grade: string;
  
  // Scenario A (Current Path)
  scenarioA: {
    cashOnHand: number;
    monthlyExpenses: number;
    monthlyRevenue: number;
    expenseGrowth: number;
    revenueGrowth: number;
    runwayMonths: number;
  };
  
  // Scenario B (Proposed Strategy)
  scenarioB?: {
    cashOnHand: number;
    monthlyExpenses: number;
    monthlyRevenue: number;
    expenseGrowth: number;
    revenueGrowth: number;
    runwayMonths: number;
  };
  
  // Planned Hires
  hiringPlan?: {
    id: string;
    title: string;
    salary: number;
    count: number;
    startMonth: number;
  }[];
  
  // Runway Delta
  runwayDelta?: number;
  
  // Additional context
  insight?: string;
}

/**
 * Generate Strategic Investor Report in Markdown format
 * Includes Scenario A/B comparison, hiring plan, and growth assumptions
 */
export function generateStrategicReport(data: StrategicReportData): string {
  const today = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const gradeEmoji = getGradeEmoji(data.grade);
  const scenarioA = data.scenarioA;
  const scenarioB = data.scenarioB;
  const hasScenarioB = !!scenarioB;
  const runwayDelta = data.runwayDelta ?? (scenarioB ? scenarioB.runwayMonths - scenarioA.runwayMonths : 0);
  
  // Calculate total planned hires
  const totalHires = data.hiringPlan?.reduce((sum, h) => sum + h.count, 0) || 0;
  const totalHiringBurn = data.hiringPlan?.reduce((sum, h) => sum + (h.salary * h.count), 0) || 0;

  let report = `# 🧬 RUNWAY DNA — Strategic Investor Report

**Generated:** ${today} at ${timestamp}  
**Report Type:** Scenario Comparison Analysis  
**Powered by:** Runway DNA Intelligence Engine

---

## 📊 Executive Summary

| Metric | Value |
|--------|-------|
| **Current DNA Grade** | ${gradeEmoji} Grade ${data.grade.toUpperCase()} |
| **Scenario A Runway** | ${formatRunwayForExport(scenarioA.runwayMonths)} |
${hasScenarioB ? `| **Scenario B Runway** | ${formatRunwayForExport(scenarioB.runwayMonths)} |
| **Runway Impact** | ${runwayDelta >= 0 ? "+" : ""}${runwayDelta.toFixed(1)} months |` : ""}
| **Planned Team Growth** | ${totalHires} new hire${totalHires !== 1 ? "s" : ""} |
| **Additional Monthly Burn** | ${formatCurrency(totalHiringBurn)} |

${data.insight ? `> ${data.insight}` : ""}

---

## 🎯 Scenario A: Current Path

*Baseline projection using current financial metrics*

| Parameter | Value |
|-----------|-------|
| Cash on Hand | ${formatCurrency(scenarioA.cashOnHand)} |
| Monthly Expenses | ${formatCurrency(scenarioA.monthlyExpenses)} |
| Monthly Revenue | ${formatCurrency(scenarioA.monthlyRevenue)} |
| Expense Growth | ${scenarioA.expenseGrowth}% annually |
| Revenue Growth | ${scenarioA.revenueGrowth}% annually |
| **Projected Runway** | **${formatRunwayForExport(scenarioA.runwayMonths)}** |

### Key Insights
- Net Monthly Burn: ${formatCurrency(scenarioA.monthlyExpenses - scenarioA.monthlyRevenue)}
- Break-even Status: ${scenarioA.monthlyRevenue >= scenarioA.monthlyExpenses ? "✅ Profitable" : "⏳ Pre-profit"}
- Runway Classification: ${getRunwayStatus(scenarioA.runwayMonths)}

`;

  // Scenario B section (if available)
  if (hasScenarioB && scenarioB) {
    report += `---

## 🚀 Scenario B: Proposed Strategy

*Projection with planned hiring and growth adjustments*

| Parameter | Value | Change from A |
|-----------|-------|---------------|
| Cash on Hand | ${formatCurrency(scenarioB.cashOnHand)} | ${scenarioB.cashOnHand === scenarioA.cashOnHand ? "—" : formatCurrency(scenarioB.cashOnHand - scenarioA.cashOnHand)} |
| Monthly Expenses | ${formatCurrency(scenarioB.monthlyExpenses)} | +${formatCurrency(scenarioB.monthlyExpenses - scenarioA.monthlyExpenses)} |
| Monthly Revenue | ${formatCurrency(scenarioB.monthlyRevenue)} | ${scenarioB.monthlyRevenue === scenarioA.monthlyRevenue ? "—" : formatCurrency(scenarioB.monthlyRevenue - scenarioA.monthlyRevenue)} |
| Expense Growth | ${scenarioB.expenseGrowth}% | ${scenarioB.expenseGrowth === scenarioA.expenseGrowth ? "—" : `${scenarioB.expenseGrowth > scenarioA.expenseGrowth ? "+" : ""}${scenarioB.expenseGrowth - scenarioA.expenseGrowth}%`} |
| Revenue Growth | ${scenarioB.revenueGrowth}% | ${scenarioB.revenueGrowth === scenarioA.revenueGrowth ? "—" : `${scenarioB.revenueGrowth > scenarioA.revenueGrowth ? "+" : ""}${scenarioB.revenueGrowth - scenarioA.revenueGrowth}%`} |
| **Projected Runway** | **${formatRunwayForExport(scenarioB.runwayMonths)}** | **${runwayDelta >= 0 ? "+" : ""}${runwayDelta.toFixed(1)} months** |

### Impact Analysis
${runwayDelta > 0 
  ? `✅ **Positive Impact:** Strategy B extends runway by ${runwayDelta.toFixed(1)} months compared to current path.`
  : runwayDelta < 0 
  ? `⚠️ **Trade-off Alert:** Strategy B shortens runway by ${Math.abs(runwayDelta).toFixed(1)} months, but may accelerate growth.`
  : `➡️ **Neutral Impact:** Strategy B maintains similar runway to current path.`
}

`;
  }

  // Hiring Plan section
  if (data.hiringPlan && data.hiringPlan.length > 0) {
    const hiresWithCount = data.hiringPlan.filter(h => h.count > 0);
    
    if (hiresWithCount.length > 0) {
      report += `---

## 👥 Planned Hiring Timeline

| Role | Headcount | Start Month | Monthly Cost |
|------|-----------|-------------|--------------|
`;
      
      hiresWithCount.forEach(hire => {
        report += `| ${hire.title} | ${hire.count} | Month ${hire.startMonth} | ${formatCurrency(hire.salary * hire.count)} |\n`;
      });

      report += `
**Total New Hires:** ${totalHires}  
**Total Additional Monthly Burn:** ${formatCurrency(totalHiringBurn)}  
**Annualized Hiring Cost:** ${formatCurrency(totalHiringBurn * 12)}

### Hiring Impact on Runway
- Pre-Hiring Runway: ${formatRunwayForExport(scenarioA.runwayMonths)}
- Post-Hiring Runway: ${hasScenarioB && scenarioB ? formatRunwayForExport(scenarioB.runwayMonths) : "N/A"}
- Net Impact: ${runwayDelta >= 0 ? "+" : ""}${runwayDelta.toFixed(1)} months

`;
    }
  }

  // Revenue Growth Assumptions
  report += `---

## 📈 Revenue Growth Assumptions

### Scenario A Growth Model
- **Annual Revenue Growth Rate:** ${scenarioA.revenueGrowth}%
- **Annual Expense Growth Rate:** ${scenarioA.expenseGrowth}%
- **Monthly Compounding:** Enabled
- **Projection Horizon:** 24 months

${hasScenarioB && scenarioB ? `### Scenario B Growth Model
- **Annual Revenue Growth Rate:** ${scenarioB.revenueGrowth}%
- **Annual Expense Growth Rate:** ${scenarioB.expenseGrowth}%
- **Hiring Impact:** Time-aware (costs begin at hire start month)
- **Projection Horizon:** 24 months` : ""}

---

## 🔮 Strategic Recommendations

${runwayDelta >= 2 
  ? `### Growth Mode
1. **Execute the hiring plan** — The additional team extends runway, indicating strong unit economics.
2. **Accelerate revenue initiatives** — Use the team expansion to drive customer acquisition.
3. **Prepare Series documentation** — Strong position for favorable fundraising terms.`
  : runwayDelta >= 0 
  ? `### Balanced Approach
1. **Proceed with caution** — Hiring plan has minimal runway impact.
2. **Stagger hires** — Consider spreading start dates to manage cash flow.
3. **Monitor metrics weekly** — Track actual vs. projected to course-correct early.`
  : runwayDelta >= -3 
  ? `### Efficiency Focus
1. **Optimize before scaling** — Current path may be more sustainable.
2. **Consider phased hiring** — Start with critical roles only.
3. **Parallel fundraising** — Begin investor conversations to extend runway buffer.`
  : `### Conservative Path
1. **Re-evaluate hiring plan** — Significant runway reduction detected.
2. **Focus on revenue first** — Build more runway before adding burn.
3. **Emergency planning** — Ensure bridge financing options are available.`
}

---

## 📋 Report Metadata

| Field | Value |
|-------|-------|
| Report Generated | ${today} at ${timestamp} |
| Analysis Type | Strategic Scenario Comparison |
| Projection Model | Compound Growth (24-month horizon) |
| Data Source | Runway DNA Simulation Engine |

---

*This strategic report was generated by Runway DNA — Your startup's financial intelligence platform.*

*For investor presentations, this report should be accompanied by detailed financial statements and supporting documentation.*
`;

  return report;
}

/**
 * Generate emoji-rich Slack/Email shareable for strategic simulation
 */
export function generateStrategicSlackUpdate(data: StrategicReportData): string {
  const gradeEmoji = getGradeEmoji(data.grade);
  const hasScenarioB = !!data.scenarioB;
  const runwayDelta = data.runwayDelta ?? (data.scenarioB 
    ? data.scenarioB.runwayMonths - data.scenarioA.runwayMonths 
    : 0
  );
  const totalHires = data.hiringPlan?.reduce((sum, h) => sum + h.count, 0) || 0;
  
  const deltaEmoji = runwayDelta >= 2 ? "🚀" : runwayDelta >= 0 ? "➡️" : "⚠️";
  const deltaText = runwayDelta >= 0 
    ? `+${runwayDelta.toFixed(1)} Months Runway extension detected`
    : `${runwayDelta.toFixed(1)} Months Runway impact`;

  let message = `🧬 *Strategic Outlook*

${gradeEmoji} *DNA Grade ${data.grade.toUpperCase()}* | Current Runway: ${formatRunwayForExport(data.scenarioA.runwayMonths)}

`;

  if (hasScenarioB) {
    message += `📊 *Scenario Comparison:*
• Path A (Current): ${data.scenarioA.runwayMonths.toFixed(1)} months
• Path B (Strategy): ${data.scenarioB!.runwayMonths.toFixed(1)} months
• ${deltaEmoji} *${deltaText}*

`;
  }

  if (totalHires > 0) {
    message += `👥 *Hiring Plan:* ${totalHires} new hire${totalHires !== 1 ? "s" : ""} planned
`;
    data.hiringPlan?.filter(h => h.count > 0).forEach(h => {
      message += `   • ${h.count}x ${h.title} (M${h.startMonth})\n`;
    });
    message += `\n`;
  }

  message += `📈 *Growth Assumptions:*
• Revenue Growth: ${data.scenarioA.revenueGrowth}% → ${data.scenarioB?.revenueGrowth ?? data.scenarioA.revenueGrowth}%
• Expense Growth: ${data.scenarioA.expenseGrowth}% → ${data.scenarioB?.expenseGrowth ?? data.scenarioA.expenseGrowth}%

_Powered by Runway DNA_ 🧬`;

  return message;
}

/**
 * Generate ultra-condensed one-liner for strategic simulation
 */
export function generateStrategicQuickStatus(data: StrategicReportData): string {
  const gradeEmoji = getGradeEmoji(data.grade);
  const runwayDelta = data.runwayDelta ?? (data.scenarioB 
    ? data.scenarioB.runwayMonths - data.scenarioA.runwayMonths 
    : 0
  );
  const deltaText = runwayDelta >= 0 
    ? `+${runwayDelta.toFixed(1)} months extension`
    : `${runwayDelta.toFixed(1)} months impact`;
  
  return `🧬 Strategic Outlook: ${gradeEmoji} Grade ${data.grade.toUpperCase()} | ${deltaText} detected | ${formatRunwayForExport(data.scenarioA.runwayMonths)} baseline`;
}

/**
 * Export Strategic Report as PDF with branded header and chart capture
 */
export async function exportStrategicPDF(
  chartElementId: string,
  data: StrategicReportData,
  filename: string = "Strategic-Investor-Report.pdf"
): Promise<void> {
  const chartElement = document.getElementById(chartElementId);
  
  // Create PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;
  
  const today = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BRANDED HEADER
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Header background
  pdf.setFillColor(13, 13, 14); // Dark background
  pdf.rect(0, 0, pageWidth, 35, "F");
  
  // Logo text (DNA helix representation)
  pdf.setTextColor(76, 110, 245); // Electric Cobalt
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("🧬 RUNWAY DNA", margin, 18);
  
  // Subtitle
  pdf.setTextColor(150, 150, 160);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Strategic Investor Report", margin, 26);
  
  // Timestamp
  pdf.setTextColor(100, 100, 110);
  pdf.setFontSize(9);
  pdf.text(`Generated: ${today} at ${timestamp}`, pageWidth - margin - 60, 18);
  
  yPosition = 45;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Executive Summary", margin, yPosition);
  yPosition += 10;
  
  // Summary table
  const summaryData = [
    ["DNA Grade", `${data.grade.toUpperCase()}`],
    ["Scenario A Runway", `${data.scenarioA.runwayMonths.toFixed(1)} months`],
  ];
  
  if (data.scenarioB) {
    summaryData.push(
      ["Scenario B Runway", `${data.scenarioB.runwayMonths.toFixed(1)} months`],
      ["Runway Impact", `${(data.runwayDelta ?? 0) >= 0 ? "+" : ""}${(data.runwayDelta ?? 0).toFixed(1)} months`]
    );
  }
  
  const totalHires = data.hiringPlan?.reduce((sum, h) => sum + h.count, 0) || 0;
  const totalHiringBurn = data.hiringPlan?.reduce((sum, h) => sum + (h.salary * h.count), 0) || 0;
  
  summaryData.push(
    ["Planned Hires", `${totalHires} new hire${totalHires !== 1 ? "s" : ""}`],
    ["Additional Burn", formatCurrency(totalHiringBurn)]
  );
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  summaryData.forEach(([label, value]) => {
    pdf.setTextColor(80, 80, 90);
    pdf.text(label + ":", margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.text(value, margin + 50, yPosition);
    pdf.setFont("helvetica", "normal");
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPARISON CHART (captured from DOM)
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: "#0D0D0E",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const chartImgData = canvas.toDataURL("image/png");
      const chartWidth = pageWidth - (margin * 2);
      const chartHeight = (canvas.height / canvas.width) * chartWidth;
      
      // Check if chart fits on current page
      if (yPosition + chartHeight + 10 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Cash Flow Comparison Chart", margin, yPosition);
      yPosition += 8;
      
      pdf.addImage(chartImgData, "PNG", margin, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 10;
    } catch (e) {
      console.error("Failed to capture chart:", e);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO DETAILS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Check if we need a new page
  if (yPosition + 60 > pageHeight - margin) {
    pdf.addPage();
    yPosition = margin;
  }
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Scenario A: Current Path", margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  const scenarioADetails = [
    `Cash: ${formatCurrency(data.scenarioA.cashOnHand)}`,
    `Monthly Expenses: ${formatCurrency(data.scenarioA.monthlyExpenses)}`,
    `Monthly Revenue: ${formatCurrency(data.scenarioA.monthlyRevenue)}`,
    `Revenue Growth: ${data.scenarioA.revenueGrowth}%`,
  ];
  scenarioADetails.forEach(line => {
    pdf.text(`• ${line}`, margin + 5, yPosition);
    yPosition += 5;
  });
  
  yPosition += 5;
  
  if (data.scenarioB) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Scenario B: Proposed Strategy", margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const scenarioBDetails = [
      `Cash: ${formatCurrency(data.scenarioB.cashOnHand)}`,
      `Monthly Expenses: ${formatCurrency(data.scenarioB.monthlyExpenses)}`,
      `Monthly Revenue: ${formatCurrency(data.scenarioB.monthlyRevenue)}`,
      `Revenue Growth: ${data.scenarioB.revenueGrowth}%`,
    ];
    scenarioBDetails.forEach(line => {
      pdf.text(`• ${line}`, margin + 5, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HIRING PLAN
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (data.hiringPlan && data.hiringPlan.filter(h => h.count > 0).length > 0) {
    if (yPosition + 40 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Hiring Plan", margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    data.hiringPlan.filter(h => h.count > 0).forEach(hire => {
      pdf.text(`• ${hire.count}x ${hire.title} — Month ${hire.startMonth} — ${formatCurrency(hire.salary * hire.count)}/mo`, margin + 5, yPosition);
      yPosition += 5;
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════════════
  
  pdf.setTextColor(120, 120, 130);
  pdf.setFontSize(8);
  pdf.text(
    "This report was generated by Runway DNA — Your startup's financial intelligence platform.",
    margin,
    pageHeight - 10
  );
  
  // Save the PDF
  pdf.save(filename);
}
