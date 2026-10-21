import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { RenewalNotice } from "@/hooks/useRenewals";

export async function generateRenewalPdf(
  element: HTMLElement,
  renewal: RenewalNotice
): Promise<void> {
  const isCurrentlyHidden =
    element.style.display === "none" ||
    element.parentElement?.style.display === "none";

  const originalDisplay = element.style.display;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;
  const originalTop = element.style.top;
  const originalZIndex = element.style.zIndex;
  const originalPointerEvents = element.style.pointerEvents;
  const originalWidth = element.style.width;

  if (isCurrentlyHidden) {
    element.style.display = "block";
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    element.style.zIndex = "-9999";
    element.style.pointerEvents = "none";
    element.style.width = "794px";
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (pdfHeight <= pageHeight + 2) {
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    } else {
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
    }

    const cleanFilename = `${renewal.noticeNumber || "Renewal_Notice"}_${(
      renewal.clientName || "Client"
    ).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    pdf.save(cleanFilename);
  } finally {
    if (isCurrentlyHidden) {
      element.style.display = originalDisplay;
      element.style.position = originalPosition;
      element.style.left = originalLeft;
      element.style.top = originalTop;
      element.style.zIndex = originalZIndex;
      element.style.pointerEvents = originalPointerEvents;
      element.style.width = originalWidth;
    }
  }
}
