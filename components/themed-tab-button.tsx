import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

export interface ThemedTabButtonProps {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isActive: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Reusable themed tab button component with icon and label
 * Automatically styles based on active state using theme colors
 */
export const ThemedTabButton: React.FC<ThemedTabButtonProps> = ({
  label,
  icon,
  isActive,
  onPress,
  style,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.tab,
        isActive && {
          backgroundColor: theme.colors.primary,
          borderRadius: 6,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.tabContent}>
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={isActive ? theme.colors.textWhite : theme.colors.textTertiary}
          style={styles.tabIcon}
        />
        <ThemedText
          style={[
            styles.tabText,
            {
              color: isActive ? theme.colors.textWhite : theme.colors.textTertiary,
            },
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabIcon: {
    marginRight: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
