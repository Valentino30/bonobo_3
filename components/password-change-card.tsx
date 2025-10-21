import { ThemedButton } from '@/components/themed-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedTextInput } from '@/components/themed-text-input'
import { useTheme } from '@/contexts/theme-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'

interface PasswordChangeCardProps {
  showForm: boolean
  onShowFormChange: (show: boolean) => void
  newPassword: string
  onNewPasswordChange: (password: string) => void
  confirmPassword: string
  onConfirmPasswordChange: (password: string) => void
  onChangePassword: () => Promise<void>
  isChanging?: boolean
}

/**
 * Reusable password change card with toggle, form inputs, and action buttons.
 * Uses controlled component pattern - parent manages all state.
 *
 * @example
 * <PasswordChangeCard
 *   showForm={showPasswordChange}
 *   onShowFormChange={setShowPasswordChange}
 *   newPassword={newPassword}
 *   onNewPasswordChange={setNewPassword}
 *   confirmPassword={confirmPassword}
 *   onConfirmPasswordChange={setConfirmPassword}
 *   onChangePassword={handleChangePassword}
 *   isChanging={isChangingPassword}
 * />
 */
export function PasswordChangeCard({
  showForm,
  onShowFormChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  onChangePassword,
  isChanging = false,
}: PasswordChangeCardProps) {
  const theme = useTheme()

  const handleCancel = () => {
    onShowFormChange(false)
    onNewPasswordChange('')
    onConfirmPasswordChange('')
  }

  const inputProps = {
    autoCapitalize: 'none' as const,
    autoCorrect: false,
    password: true,
    fullWidth: true,
  }

  if (!showForm) {
    return (
      <View style={styles.section}>
        <ThemedButton
          title="Change Password"
          onPress={() => onShowFormChange(true)}
          variant="secondary"
          size="large"
          icon="lock-outline"
          iconPosition="left"
          align="left"
          fullWidth
        />
      </View>
    )
  }

  return (
    <View style={styles.section}>
      <View
        style={[
          styles.passwordCard,
          { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border },
        ]}
      >
        <View style={[styles.passwordHeader, { borderBottomColor: theme.colors.borderLight }]}>
          <MaterialCommunityIcons name="lock-outline" size={18} color={theme.colors.primary} />
          <ThemedText style={[styles.passwordHeaderText, { color: theme.colors.text }]}>
            Update Password
          </ThemedText>
        </View>

        <View style={styles.passwordForm}>
          <ThemedTextInput
            {...inputProps}
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChangeText={onNewPasswordChange}
            icon="lock-outline"
          />

          <ThemedTextInput
            {...inputProps}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            icon="lock-check-outline"
          />

          <View style={styles.passwordButtons}>
            <ThemedButton
              title="Cancel"
              onPress={handleCancel}
              variant="secondary"
              size="medium"
              disabled={isChanging}
              style={{ flex: 1 }}
            />
            <ThemedButton
              title="Update"
              onPress={onChangePassword}
              variant="primary"
              size="medium"
              loading={isChanging}
              disabled={isChanging}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  passwordCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  passwordHeaderText: {
    fontSize: 16,
    fontWeight: '400',
  },
  passwordForm: {
    gap: 16,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
})
