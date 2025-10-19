import { ThemedTabButton } from '@/components/themed-tab-button'
import { useTheme } from '@/contexts/theme-context'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { StyleSheet, View, type ViewStyle } from 'react-native'

export type Tab<T extends string = string> = {
  id: T
  label: string
  icon: keyof typeof MaterialCommunityIcons.glyphMap
}

type TabNavigationProps<T extends string = string> = {
  tabs: Tab<T>[]
  activeTab: T
  onTabChange: (tabId: T) => void | Promise<void>
  style?: ViewStyle
}

/**
 * Reusable tab navigation component
 * Displays a row of themed tab buttons with active state management
 */
export function TabNavigation<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  style,
}: TabNavigationProps<T>) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.backgroundLight, shadowColor: theme.colors.shadow },
        style,
      ]}
    >
      {tabs.map((tab) => (
        <ThemedTabButton
          key={tab.id}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.id}
          onPress={() => onTabChange(tab.id)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
})
