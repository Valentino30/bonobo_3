import { ThemedText } from '@/components/themed-text'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { getVariantStyles, type VariantType } from '@/utils/badge-variants'

interface InfoCardProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  iconColor?: string
  iconSize?: number
  title: string
  description: string
  variant?: Exclude<VariantType, 'default' | 'primary'>
}

export function InfoCard({
  icon = 'information',
  iconColor,
  iconSize = 24,
  title,
  description,
  variant = 'info',
}: InfoCardProps) {
  const theme = useTheme()
  const style = getVariantStyles(theme, variant, { iconColor })

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name={icon} size={iconSize} color={style.iconColor} />
        <ThemedText style={[styles.title, { color: style.titleColor }]}>{title}</ThemedText>
      </View>
      <ThemedText style={[styles.description, { color: style.textColor }]}>{description}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
})
