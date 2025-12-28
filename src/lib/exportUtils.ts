import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface HealthCardData {
  runway_months: number;
  grade: string;
  monthly_burn: number;
  cash_on_hand: number;
  profit_margin: number;
  insight: string;
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
  const text = `🧬 Just decoded my startup's Financial DNA with @RunwayDNA!

📊 Runway: ${data.runway_months.toFixed(1)} months
🏆 Health Grade: ${data.grade}
💰 Monthly Burn: $${data.monthly_burn.toLocaleString()}

${data.insight}

#StartupLife #FounderLife #FinancialHealth`;

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "width=600,height=400");
}
