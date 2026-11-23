/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

import { renderToBuffer } from '@react-pdf/renderer';

export interface PdfOptions {
  document: Parameters<typeof renderToBuffer>[0];
  fileName?: string;
}

export class PdfService {
  static async generatePdf(options: PdfOptions): Promise<Buffer> {
    return renderToBuffer(options.document);
  }
}
