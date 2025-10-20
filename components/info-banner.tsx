import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, Text, View } from 'react-native'
import { getVariantStyles, type VariantType } from '@/utils/badge-variants'

type InfoBannerProps = {
  /** Icon name from MaterialCommunityIcons */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  /** Size of the icon */
  iconSize?: number
  /** Banner text content */
  text: string
  /** Visual variant */
  variant?: Exclude<VariantType, 'default' | 'primary'>
}

/**
 * Lightweight banner component for displaying tips, hints, or status messages
 * Displays icon and text horizontally in a compact format
 */
export function InfoBanner({ icon = 'lightbulb-on-outline', iconSize = 18, text, variant = 'info' }: InfoBannerProps) {
  const theme = useTheme()
  const style = getVariantStyles(theme, variant)

  return (
    <View style={[styles.container, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
      <MaterialCommunityIcons name={icon} size={iconSize} color={style.iconColor} />
      <Text style={[styles.text, { color: style.textColor }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
})
