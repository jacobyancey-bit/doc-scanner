import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DocumentPage, ScannedDocument } from '../types/document';

export class PDFService {
  /**
   * Generates a multi-page PDF from scanned page images.
   * Can be run on mobile or adapted for web using standard Uint8Array / Blob.
   */
  static async createPDFFromPages(
    pages: DocumentPage[],
    documentTitle: string
  ): Promise<string> {
    if (!pages || pages.length === 0) {
      throw new Error('At least one page is required to generate a PDF.');
    }

    const pdfDoc = await PDFDocument.create();

    for (const page of pages) {
      // Read local image as base64
      const imageBase64 = await FileSystem.readAsStringAsync(page.imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Embed image (handles both JPG and PNG)
      let embeddedImage;
      if (page.imageUri.toLowerCase().endsWith('.png')) {
        embeddedImage = await pdfDoc.embedPng(imageBase64);
      } else {
        embeddedImage = await pdfDoc.embedJpg(imageBase64);
      }

      // Add a page that matches image dimensions
      const pdfPage = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
      pdfPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
    }

    // Save PDF as Base64
    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: false });

    // Output to app documents directory
    const sanitizedTitle = documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outputUri = `${FileSystem.documentDirectory}${sanitizedTitle}_${Date.now()}.pdf`;

    await FileSystem.writeAsStringAsync(outputUri, pdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputUri;
  }

  /**
   * Triggers the Android Native Share Sheet to export or save the PDF.
   */
  static async sharePDF(pdfUri: string, dialogTitle: string = 'Share Document'): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle,
    });
  }

  /**
   * Reads PDF as base64 string for direct upload/sync to your website API.
   */
  static async exportPDFBase64(pdfUri: string): Promise<string> {
    return await FileSystem.readAsStringAsync(pdfUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

