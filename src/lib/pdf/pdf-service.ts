/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

"use client";

import { renderToStream } from '@react-pdf/renderer';
import type { PDFDocument } from '@react-pdf/renderer';

export interface PdfOptions {
  document: PDFDocument;
  fileName?: string;
}

export class PdfService {
  /**
   * Generates a PDF buffer from a react-pdf Document using dynamic imports
   * to avoid build-time dependency errors.
   */
  static async generatePdf(options: PdfOptions): Promise<Buffer> {
    const { document } = options;
    
    try {
      // Dynamic import to avoid build-time errors if the package is missing
      const { renderToStream } = await import('@react-pdf/renderer');
      
      const stream = await renderToStream(document);
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate PDF using react-pdf. Ensure it is installed.');
    }
  }
}
