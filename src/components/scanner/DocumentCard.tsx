import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../tokens';
import { ScannedDocument } from '../../types/document';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';

export interface DocumentCardProps {
  document: ScannedDocument;
  onPress: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPress,
  onShare,
  onDelete,
}) => {
  const { colors, spacing, radii, elevations } = useTheme();
  const firstPageUri = document.pages[0]?.imageUri;

  const formattedDate = new Date(document.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginBottom: spacing.md,
          ...elevations[2],
        },
      ]}
      android_ripple={{ color: colors.ripple }}
    >
      <View style={styles.contentRow}>
        {Boolean(firstPageUri) && (
          <Image
            source={{ uri: firstPageUri }}
            style={[styles.thumbnail, { borderRadius: radii.sm, backgroundColor: colors.surfaceVariant }]}
            resizeMode="cover"
          />
        )}

        <View style={styles.metaCol}>
          <AppText variant="titleSmall" numberOfLines={1}>
            {document.title}
          </AppText>

          <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
            {formattedDate} • {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
          </AppText>

          {document.syncStatus === 'synced' && (
            <View style={[styles.syncBadge, { backgroundColor: colors.surfaceVariant }]}>
              <AppText variant="caption" color={colors.success} style={{ fontSize: 10 }}>
                ● Synced with Web
              </AppText>
            </View>
          )}

          <View style={styles.actionRow}>
            <AppButton
              title="Share PDF"
              variant="outline"
              onPress={onShare}
              style={styles.actionBtn}
              textStyle={{ fontSize: 12 }}
            />
            <AppButton
              title="Delete"
              variant="text"
              onPress={onDelete}
              style={[styles.actionBtn, { marginLeft: spacing.sm }]}
              textStyle={{ fontSize: 12, color: colors.error }}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 84,
    marginRight: 14,
  },
  metaCol: {
    flex: 1,
  },
  syncBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  actionBtn: {
    minHeight: 32,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});

