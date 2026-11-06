import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
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
  const { colors, spacing } = useTheme();
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanPress = async () => {
    setIsScanning(true);
    try {
      const doc = await ScannerService.scanDocument({
        documentTitle: `Document_${documents.length + 1}`,
      });

      if (doc) {
        // If there is an active web session triggered by your website QR code!
        if (activeWebSession?.sessionId && activeWebSession.callbackUrl && doc.pdfUri) {
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
        }

        setDocuments((prev) => [doc, ...prev]);
      }
    } catch (error) {
      Alert.alert('Scan Failed', 'Could not complete scan session.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleShare = async (doc: ScannedDocument) => {
    try {
      if (doc.pdfUri) {
        await PDFService.sharePDF(doc.pdfUri, `Share ${doc.title}`);
      } else {
        // Generate PDF on the fly if needed
        const newPdfUri = await PDFService.createPDFFromPages(doc.pages, doc.title);
        doc.pdfUri = newPdfUri;
        await PDFService.sharePDF(newPdfUri, `Share ${doc.title}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share document.');
    }
  };

  const handleDelete = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, { padding: spacing.lg, borderBottomColor: colors.border }]}>
        <View>
          <AppText variant="titleMedium">My Documents</AppText>
          <AppText variant="bodySmall" color={colors.textSecondary}>
            100% on-device & private
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
            onDelete={() => handleDelete(item.id)}
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
    paddingTop: 80,
  },
});

