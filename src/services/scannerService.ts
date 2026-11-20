import DocumentScanner, {
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';
import { DocumentPage, ScannedDocument } from '../types/document';
import { PDFService } from './pdfService';

export interface ScanOptions {
  maxNumDocuments?: number;
  autoGeneratePdf?: boolean;
  documentTitle?: string;
}

export class ScannerService {
  /**
   * Launches Google ML Kit Document Scanner activity on Android.
   * Prompts user with camera, auto edge detection, crop adjustment, and filters.
   */
  static async scanDocument(options: ScanOptions = {}): Promise<ScannedDocument | null> {
    const {
      maxNumDocuments = 24,
      autoGeneratePdf = true,
      documentTitle = `Scan_${new Date().toISOString().slice(0, 10)}`,
    } = options;

    try {
      const response = await DocumentScanner.scanDocument({
        maxNumDocuments,
        croppedImageQuality: 92,
      });

      const { status, scannedImages } = response;

      // Handle normal user cancellation (user backed out of camera)
      if (status === ScanDocumentResponseStatus.Cancel || status === ('cancel' as any)) {
        return null;
      }

      if (
        status !== ScanDocumentResponseStatus.Success &&
        status !== ('success' as any) &&
        (!scannedImages || scannedImages.length === 0)
      ) {
        return null;
      }

      if (!scannedImages || scannedImages.length === 0) {
        return null;
      }

      // Map scanned image paths to structured DocumentPage objects
      const pages: DocumentPage[] = scannedImages.map((imageUri, index) => ({
        id: `page_${Date.now()}_${index + 1}`,
        pageNumber: index + 1,
        imageUri,
      }));

      const docId = `doc_${Date.now()}`;
      let pdfUri: string | undefined;

      if (autoGeneratePdf) {
        try {
          pdfUri = await PDFService.createPDFFromPages(pages, documentTitle);
        } catch (pdfErr) {
          console.warn('PDF generation deferred:', pdfErr);
        }
      }

      const scannedDocument: ScannedDocument = {
        id: docId,
        title: documentTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageCount: pages.length,
        pages,
        pdfUri,
        syncStatus: 'local',
      };

      return scannedDocument;
    } catch (error) {
      console.error('Document scanning exception:', error);
      throw error;
    }
  }
}


