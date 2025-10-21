import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import {
  getIconButtonVariantStyles,
  getIconButtonSizeStyles,
  type IconButtonVariant,
  type IconButtonSize,
} from '@/utils/icon-button-variants'

export interface ThemedIconButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  onPress: (event?: any) => void
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  style?: ViewStyle | ViewStyle[]
  activeOpacity?: number
  hitSlop?: { top: number; bottom: number; left: number; right: number }
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
  const theme = useTheme()

  // Determine if button is disabled
  const isDisabled = disabled

  // Get styles from utility functions
  const variantStyles = getIconButtonVariantStyles(theme, variant)
  const sizeValues = getIconButtonSizeStyles(size)

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
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
})
