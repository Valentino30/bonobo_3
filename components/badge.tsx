import { ThemedText } from '@/components/themed-text'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { getVariantStyles, type VariantType } from '@/utils/badge-variants'

interface BadgeProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  iconSize?: number
  iconColor?: string
  text: string
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  variant?: VariantType
  containerStyle?: ViewStyle
}

export function Badge({
  icon,
  iconSize = 16,
  iconColor,
  text,
  textColor,
  backgroundColor,
  borderColor,
  variant = 'default',
  containerStyle,
}: BadgeProps) {
  const theme = useTheme()

  const style = getVariantStyles(theme, variant, {
    backgroundColor,
    borderColor,
    textColor,
    iconColor,
  })

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
          },
        ]}
      >
        {icon && <MaterialCommunityIcons name={icon} size={iconSize} color={style.iconColor} />}
        <ThemedText style={[styles.text, { color: style.textColor }]}>{text}</ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
})
