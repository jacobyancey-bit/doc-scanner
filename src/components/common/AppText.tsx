import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme, textVariants } from '../../tokens';

export interface AppTextProps extends TextProps {
  variant?: keyof typeof textVariants;
  color?: string;
  style?: TextStyle | TextStyle[];
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMedium',
  color,
  style,
  children,
  ...rest
}) => {
  const { colors } = useTheme();
  const selectedVariantStyle = textVariants[variant] || textVariants.bodyMedium;

  return (
    <Text
      style={[
        selectedVariantStyle,
        { color: color || colors.textPrimary },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

