export const typography = {
  fontFamilies: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 38,
    '4xl': 44,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  } as const,
};

export const textVariants = {
  display: {
    fontSize: typography.fontSizes['4xl'],
    lineHeight: typography.lineHeights['4xl'],
    fontWeight: typography.fontWeights.bold,
  },
  titleLarge: {
    fontSize: typography.fontSizes['3xl'],
    lineHeight: typography.lineHeights['3xl'],
    fontWeight: typography.fontWeights.bold,
  },
  titleMedium: {
    fontSize: typography.fontSizes['2xl'],
    lineHeight: typography.lineHeights['2xl'],
    fontWeight: typography.fontWeights.semiBold,
  },
  titleSmall: {
    fontSize: typography.fontSizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.fontWeights.semiBold,
  },
  bodyLarge: {
    fontSize: typography.fontSizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.fontWeights.regular,
  },
  bodyMedium: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.fontWeights.regular,
  },
  bodySmall: {
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.fontWeights.regular,
  },
  caption: {
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.fontWeights.medium,
  },
  button: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.fontWeights.semiBold,
  },
};

