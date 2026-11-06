export interface DocumentPage {
  id: string;
  pageNumber: number;
  imageUri: string;
  width?: number;
  height?: number;
}

export interface ScannedDocument {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  pages: DocumentPage[];
  pdfUri?: string;
  fileSizeBytes?: number;
  syncStatus: 'local' | 'synced' | 'pending';
}

/**
 * Universal payload for transferring documents between
 * the mobile app and your website.
 */
export interface WebSyncPayload {
  version: '1.0';
  documentId: string;
  title: string;
  createdAt: string;
  pagesBase64?: string[];
  pdfBase64?: string;
}

