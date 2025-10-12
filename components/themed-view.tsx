import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { View, type ViewProps } from 'react-native'

export type ThemedViewProps = ViewProps & {
  lightColor?: string
  darkColor?: string
}

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const theme = useColorScheme()
  const backgroundColor = lightColor

  return <View style={[{ backgroundColor: backgroundColor ?? Colors[theme].background }, style]} {...otherProps} />
}
