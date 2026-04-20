import { Injectable } from '@angular/core';
import jsPDF, { jsPDFOptions } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;          // default: page.pdf
  marginMm?: number;          // default: 10
  format?: 'a4' | 'letter';   // default: a4
  orientation?: 'p' | 'portrait' | 'l' | 'landscape'; // default: p
  scale?: number;             // default: 2 (sharper)
}

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  async exportElement(el: HTMLElement, opts: PdfExportOptions = {}) {
    const {
      fileName = 'page.pdf',
      marginMm = 10,
      format = 'a4',
      orientation = 'p',
      scale = 2
    } = opts;

    // Wait for fonts/images
    await (document as any).fonts?.ready?.catch(() => {});

    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: el.scrollWidth
    });

    const pdf = new jsPDF({
      orientation: (orientation === 'portrait' ? 'p' :
                    orientation === 'landscape' ? 'l' : orientation) as jsPDFOptions['orientation'],
      unit: 'mm',
      format,
      compress: true
    });

    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const contentW = pdfW - marginMm * 2;
    const contentH = pdfH - marginMm * 2;

    const imgW = contentW;
    const imgH = (canvas.height * imgW) / canvas.width;

    const sliceH = Math.round((contentH * canvas.width) / imgW); // pixels per page
    const totalPages = Math.max(1, Math.ceil(canvas.height / sliceH));

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.min(sliceH, canvas.height);
    const ctx = pageCanvas.getContext('2d')!;

    for (let i = 0; i < totalPages; i++) {
      const srcY = i * sliceH;
      const pageHeightPx = Math.min(sliceH, canvas.height - srcY);

      // draw slice
      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, srcY, canvas.width, pageHeightPx, 0, 0, canvas.width, pageHeightPx);

      const imgData = pageCanvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', marginMm, marginMm, imgW, (pageHeightPx * imgW) / canvas.width);
    }

    pdf.save(fileName);
  }

  exportCurrentPage(opts?: PdfExportOptions) {
    const root = document.documentElement; // full page
    return this.exportElement(root, { fileName: 'page.pdf', ...opts });
  }
}
