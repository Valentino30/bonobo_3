import { ThemedButton } from '@/components/themed-button'
import { useTheme } from '@/contexts/theme-context'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

export type BottomSheetAction = {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'destructive'
}

interface BottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean
  /** Callback when the sheet should be dismissed */
  onDismiss: () => void
  /** Array of actions to display as buttons */
  actions: BottomSheetAction[]
}

/**
 * Bottom sheet modal with action buttons
 * Slides up from the bottom with a backdrop overlay
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   visible={showMenu}
 *   onDismiss={() => setShowMenu(false)}
 *   actions={[
 *     { title: 'Delete', onPress: handleDelete, variant: 'destructive' },
 *     { title: 'Cancel', onPress: () => setShowMenu(false), variant: 'secondary' }
 *   ]}
 * />
 * ```
 */
export function BottomSheet({ visible, onDismiss, actions }: BottomSheetProps) {
  const theme = useTheme()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity
        style={[styles.modalOverlay, { backgroundColor: theme.colors.backgroundOverlay }]}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View style={[styles.bottomDrawer, { backgroundColor: theme.colors.backgroundLight }]}>
          {actions.map((action, index) => (
            <ThemedButton
              key={index}
              title={action.title}
              onPress={action.onPress}
              variant={action.variant || 'primary'}
              size="large"
              fullWidth
              style={styles.actionButton}
            />
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomDrawer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  actionButton: {
    marginBottom: 12,
  },
})
