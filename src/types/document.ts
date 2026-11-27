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
 * Universal payload structure for transferring scanned documents
 * to the authorized dangling-dice-studios.com web session endpoint.
 */
export interface WebSyncPayload {
  sessionId: string;
  title: string;
  pdfBase64: string;
  timestamp: string;
}
