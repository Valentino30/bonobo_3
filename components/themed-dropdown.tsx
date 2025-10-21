import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/contexts/theme-context'

export interface DropdownOption {
  label: string
  value: string
}

interface ThemedDropdownProps {
  value: string
  options: DropdownOption[]
  onValueChange: (value: string) => void
  placeholder?: string
}

export function ThemedDropdown({ value, options, onValueChange, placeholder }: ThemedDropdownProps) {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setIsOpen(false)
  }

  return (
    <>
      {/* Dropdown Trigger */}
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ThemedText style={[styles.triggerText, { color: theme.colors.text }]}>
          {selectedOption?.label || placeholder || 'Select...'}
        </ThemedText>
        <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.text} />
      </Pressable>

      {/* Dropdown Modal */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.optionsContainer,
                {
                  backgroundColor: theme.colors.backgroundLight,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
                {options.map((option) => {
                  const isSelected = option.value === value
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected ? theme.colors.primary + '15' : 'transparent',
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color: isSelected ? theme.colors.primary : theme.colors.text,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                      {isSelected && <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />}
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
  },
  optionsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionsScroll: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
})
