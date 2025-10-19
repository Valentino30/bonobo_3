import { BackButton } from '@/components/back-button'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

interface ScreenHeaderProps {
  /**
   * The title text to display in the header
   */
  title: string

  /**
   * Whether to show the back button (default: true)
   */
  showBackButton?: boolean

  /**
   * Additional custom styles for the container
   */
  style?: StyleProp<ViewStyle>

  /**
   * Additional content to render after the title (e.g., tabs, buttons)
   */
  children?: React.ReactNode
}

/**
 * Reusable screen header component with optional back button and title.
 * Commonly used across screens for consistent header layout.
 *
 * @example
 * // Simple header with title
 * <ScreenHeader title="My Profile" />
 *
 * @example
 * // Header with additional content
 * <ScreenHeader title="Analysis">
 *   <TabNavigation />
 * </ScreenHeader>
 *
 * @example
 * // Header without back button
 * <ScreenHeader title="Settings" showBackButton={false} />
 */
export function ScreenHeader({ title, showBackButton = true, style, children }: ScreenHeaderProps) {
  const theme = useTheme()

  return (
    <View style={style}>
      <View style={styles.headerTop}>
        {showBackButton && <BackButton />}
        <ThemedText type="title" style={[styles.title, { color: theme.colors.text, fontWeight: '300' }]}>
          {title}
        </ThemedText>
      </View>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  childrenContainer: {
    marginTop: 16,
  },
})
