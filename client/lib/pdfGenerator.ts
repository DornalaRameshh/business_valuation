import jsPDF from 'jspdf';
import { ValuationReport, WizardData } from './fastapi';

export function generateValuationPDF(
  wizardData: WizardData,
  valuationReport: ValuationReport,
  confidence: number
): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    pdf.setFontSize(fontSize);
    
    const lines = pdf.splitTextToSize(text, pageWidth - 40);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * fontSize * 0.5 + 5;
  };

  // Header
  addText(`${wizardData.step1?.businessName || 'Startup'} Valuation Report`, 20, true);
  addText(`Generated on: ${new Date().toLocaleDateString()}`, 10);
  yPosition += 10;

  // Executive Summary
  addText('EXECUTIVE SUMMARY', 16, true);
  addText(`Confidence Level: ${confidence}%`);
  
  if (valuationReport.finalValuation?.finalRange) {
    const { lower, upper } = valuationReport.finalValuation.finalRange;
    addText(`Valuation Range: $${lower}M - $${upper}M`, 14, true);
  }
  
  addText(`Business Stage: ${valuationReport.businessSummary?.stageAssessment || 'N/A'}`);
  yPosition += 10;

  // Business Summary
  addText('BUSINESS ANALYSIS', 16, true);
  if (valuationReport.businessSummary?.summary) {
    addText(valuationReport.businessSummary.summary);
  }
  yPosition += 5;

  // Key Strengths
  if (valuationReport.businessSummary?.keyStrengths?.length) {
    addText('Key Strengths:', 12, true);
    valuationReport.businessSummary.keyStrengths.forEach(strength => {
      addText(`• ${strength}`);
    });
    yPosition += 5;
  }

  // Valuation Methods
  addText('VALUATION METHODS', 16, true);
  if (valuationReport.calculations?.length) {
    valuationReport.calculations.forEach((calc, index) => {
      addText(`${index + 1}. ${calc.method}`, 12, true);
      addText(`Range: $${calc.valuationRange.lower}M - $${calc.valuationRange.upper}M`);
      addText(`Explanation: ${calc.explanation}`);
      if (calc.narrative) {
        addText(`Analysis: ${calc.narrative}`);
      }
      yPosition += 5;
    });
  }

  // Strategic Context
  if (valuationReport.strategicContext) {
    addText('STRATEGIC CONTEXT', 16, true);
    addText(valuationReport.strategicContext);
    yPosition += 5;
  }

  // Competitor Analysis
  if (valuationReport.competitorAnalysis) {
    addText('COMPETITIVE LANDSCAPE', 16, true);
    if (valuationReport.competitorAnalysis.competitors?.length) {
      addText('Key Competitors:', 12, true);
      valuationReport.competitorAnalysis.competitors.forEach(competitor => {
        addText(`• ${competitor}`);
      });
    }
    if (valuationReport.competitorAnalysis.commentary) {
      addText('Market Position:', 12, true);
      addText(valuationReport.competitorAnalysis.commentary);
    }
    yPosition += 5;
  }

  // Final Recommendations
  if (valuationReport.finalValuation?.recommendations?.length) {
    addText('RECOMMENDATIONS', 16, true);
    valuationReport.finalValuation.recommendations.forEach(rec => {
      addText(`• ${rec}`);
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This report was generated using AI analysis and should be used for informational purposes only.', 20, pageHeight - 10);

  // Save the PDF
  const fileName = `${wizardData.step1?.businessName || 'startup'}-valuation-report.pdf`;
  pdf.save(fileName);
}