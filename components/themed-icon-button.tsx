import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/theme-context';

export type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost';
export type IconButtonSize = 'small' | 'medium' | 'large';

export interface ThemedIconButtonProps {
  /** Icon name from MaterialCommunityIcons */
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Click handler (optionally receives event) */
  onPress: (event?: any) => void;
  /** Visual variant of the button */
  variant?: IconButtonVariant;
  /** Size of the button */
  size?: IconButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Custom style override */
  style?: ViewStyle;
  /** Active opacity (default 0.7) */
  activeOpacity?: number;
  /** Hit slop for better touch target */
  hitSlop?: { top: number; bottom: number; left: number; right: number };
}

export const ThemedIconButton: React.FC<ThemedIconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  style,
  activeOpacity = 0.7,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
}) => {
  const theme = useTheme();

  // Determine if button is disabled
  const isDisabled = disabled;

  // Get variant styles
  const getVariantStyles = (): { iconColor: string; backgroundColor?: string } => {
    switch (variant) {
      case 'primary':
        return {
          iconColor: theme.colors.primary,
          backgroundColor: 'transparent',
        };

      case 'secondary':
        return {
          iconColor: theme.colors.textSecondary,
          backgroundColor: 'transparent',
        };

      case 'ghost':
        return {
          iconColor: theme.colors.textTertiary,
          backgroundColor: 'transparent',
        };

      case 'default':
      default:
        return {
          iconColor: theme.colors.text,
          backgroundColor: 'transparent',
        };
    }
  };

  // Get size values
  const getSizeValues = (): { iconSize: number; padding: number } => {
    switch (size) {
      case 'small':
        return {
          iconSize: 18,
          padding: 6,
        };

      case 'medium':
        return {
          iconSize: 24,
          padding: 8,
        };

      case 'large':
        return {
          iconSize: 28,
          padding: 10,
        };

      default:
        return {
          iconSize: 24,
          padding: 8,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeValues = getSizeValues();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      style={[
        styles.container,
        {
          padding: sizeValues.padding,
          backgroundColor: variantStyles.backgroundColor,
        },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={sizeValues.iconSize}
        color={isDisabled ? theme.colors.textLight : variantStyles.iconColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
