import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../tokens';
import { ScannedDocument } from '../types/document';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { AppText } from '../components/common/AppText';
import { AppButton } from '../components/common/AppButton';
import { DocumentCard } from '../components/scanner/DocumentCard';
import { ScannerService } from '../services/scannerService';
import { PDFService } from '../services/pdfService';
import { DeepLinkService, WebSessionTrigger } from '../services/deepLinkService';

export interface DocumentListScreenProps {
  activeWebSession?: WebSessionTrigger | null;
  onClearWebSession?: () => void;
}

export const DocumentListScreen: React.FC<DocumentListScreenProps> = ({
  activeWebSession,
  onClearWebSession,
}) => {
  const { colors, spacing, radii } = useTheme();
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  // Background cleanup of orphaned temp files on app start
  useEffect(() => {
    PDFService.cleanupOrphanedFiles();
  }, []);

  const handleScanPress = async () => {
    setIsScanning(true);
    setProcessingStatus('Opening Camera...');
    try {
      const doc = await ScannerService.scanDocument({
        documentTitle: `Document_${documents.length + 1}`,
      });

      if (doc) {
        // If there is an active web session triggered by your website QR code!
        if (activeWebSession?.sessionId && activeWebSession.callbackUrl && doc.pdfUri) {
          setProcessingStatus('Syncing to Web Session...');
          try {
            const pdfBase64 = await PDFService.exportPDFBase64(doc.pdfUri);
            const success = await DeepLinkService.sendToWebSession(
              activeWebSession.callbackUrl,
              activeWebSession.sessionId,
              pdfBase64,
              doc.title
            );

            if (success) {
              doc.syncStatus = 'synced';
              Alert.alert('Transferred to Web', 'Document successfully sent to your browser session!');
              onClearWebSession?.();
            }
          } catch (syncErr) {
            console.warn('Web sync deferred:', syncErr);
          }
        }

        setDocuments((prev) => [doc, ...prev]);
      }
    } catch (error: any) {
      console.error('Scan handling notice:', error?.message || 'Scan cancelled');
      Alert.alert(
        'Scan Notice',
        error?.message || 'Could not complete scan session. Ensure camera permission is granted.'
      );
    } finally {
      setIsScanning(false);
      setProcessingStatus(null);
    }
  };

  const handleShare = async (doc: ScannedDocument) => {
    try {
      if (doc.pdfUri) {
        await PDFService.sharePDF(doc.pdfUri, `Share ${doc.title}`);
      } else {
        setProcessingStatus('Compiling PDF...');
        const newPdfUri = await PDFService.createPDFFromPages(doc.pages, doc.title);
        doc.pdfUri = newPdfUri;
        await PDFService.sharePDF(newPdfUri, `Share ${doc.title}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share document.');
    } finally {
      setProcessingStatus(null);
    }
  };

  const handleDelete = async (doc: ScannedDocument) => {
    // Zero-Retention Guarantee: Physically shred files from local disk
    await PDFService.deleteDocumentFiles(doc);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, { padding: spacing.lg, borderBottomColor: colors.border }]}>
        <View>
          <AppText variant="titleMedium">My Documents</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            🔒 Zero-Retention • Processed in-memory
          </AppText>
        </View>

        <AppButton
          title="+ Scan"
          variant="primary"
          onPress={handleScanPress}
          loading={isScanning}
          style={styles.scanBtn}
        />
      </View>

      {/* Processing Indicator Banner */}
      {Boolean(processingStatus) && (
        <View style={[styles.processingBanner, { backgroundColor: colors.surfaceVariant }]}>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          <AppText variant="caption" color={colors.primary}>
            {processingStatus}
          </AppText>
        </View>
      )}

      {/* Zero-Retention Guarantee Banner */}
      <View style={[styles.zeroRetentionBadge, { backgroundColor: '#131B2E', marginHorizontal: spacing.md, marginTop: spacing.sm }]}>
        <AppText variant="caption" color={colors.success} style={{ fontWeight: '600' }}>
          🛡️ Zero-Retention Guarantee
        </AppText>
        <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 11, marginTop: 2 }}>
          Your documents are never uploaded to studio servers. Deleting shreds local storage permanently.
        </AppText>
      </View>

      {Boolean(activeWebSession?.sessionId) && (
        <View style={[styles.webNotice, { backgroundColor: colors.surfaceVariant, margin: spacing.md }]}>
          <AppText variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
            🔗 Connected to Web Session: {activeWebSession?.sessionId?.slice(0, 8)}...
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Next scan will be sent directly to your website.
          </AppText>
        </View>
      )}

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onPress={() => handleShare(item)}
            onShare={() => handleShare(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText variant="titleSmall" color={colors.textSecondary} style={{ marginBottom: 6 }}>
              No documents yet
            </AppText>
            <AppText variant="bodySmall" color={colors.textMuted} style={{ textAlign: 'center', marginBottom: 20 }}>
              Tap "+ Scan" to capture pages with auto edge detection, shadow removal, and instant PDF export.
            </AppText>
            <AppButton
              title="Start Scanning"
              variant="outline"
              onPress={handleScanPress}
              loading={isScanning}
            />

            {/* Studio Cross-Promotion Box */}
            <View style={[styles.studioPromotionBox, { backgroundColor: colors.surfaceVariant, borderRadius: radii.md, marginTop: 40 }]}>
              <AppText variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>
                Dangling Dice Studios™
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: 4, fontSize: 11 }}>
                Explore Tutor Calculator, Beats & more privacy-first utilities on Google Play.
              </AppText>
            </View>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scanBtn: {
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  zeroRetentionBadge: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  webNotice: {
    padding: 12,
    borderRadius: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  studioPromotionBox: {
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
});


