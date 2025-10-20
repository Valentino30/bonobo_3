import { useRouter } from 'expo-router';
import { ThemedIconButton } from '@/components/themed-icon-button';
import type { ViewStyle } from 'react-native';

export interface BackButtonProps {
  /** Custom onPress handler (if not provided, uses router.back()) */
  onPress?: () => void;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Standard back button component with chevron-left icon
 * Automatically uses router.back() if no onPress handler is provided
 */
export const BackButton: React.FC<BackButtonProps> = ({ onPress, style }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <ThemedIconButton
      icon="chevron-left"
      onPress={handlePress}
      variant="primary"
      size="large"
      style={style}
    />
  );
};
