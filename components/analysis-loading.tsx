import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

const STEPS = [
  {
    title: 'ANALYZING CHAT',
    subtitle: 'Processing messages',
  },
  {
    title: 'EXTRACTING STATS',
    subtitle: 'Calculating metrics',
  },
  {
    title: 'FINDING PATTERNS',
    subtitle: 'Analyzing behavior',
  },
  {
    title: 'FINALIZING',
    subtitle: 'Preparing report',
  },
]

export function AnalysisLoading() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Don't advance if we're already on the last step
    if (currentStep >= STEPS.length - 1) {
      return
    }

    // Use setTimeout to advance to the next step after 1 second
    const timeout = setTimeout(() => {
      setCurrentStep(currentStep + 1)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [currentStep])

  return (
    <View style={styles.container}>
      {/* Current Step Info */}
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>
          STEP {currentStep + 1} OF {STEPS.length}
        </Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[styles.stepDot, index <= currentStep && styles.stepDotActive]} />
            {index < STEPS.length - 1 && (
              <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>

      {/* Loading Spinner */}
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#6B8E5A" />
      </View>

      {/* Title and Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{STEPS[currentStep].title}</Text>
        <Text style={styles.subtitle}>{STEPS[currentStep].subtitle}</Text>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacySection}>
        <View style={styles.privacyHeader}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#6B8E5A" />
          <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
        </View>
        <Text style={styles.privacyText}>
          All chat data is stored securely on your device. We never upload your conversations to our servers. AI
          analysis is performed using encrypted requests.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
  },
  stepNumberContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B8E5A',
    letterSpacing: 1.2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 60,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  stepDotActive: {
    backgroundColor: '#6B8E5A',
    borderColor: '#6B8E5A',
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#6B8E5A',
  },
  spinnerContainer: {
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '300',
    color: '#999999',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  privacySection: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#F5F9F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E3CE',
    maxWidth: 400,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B8E5A',
    marginLeft: 6,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5C6B63',
    textAlign: 'center',
  },
})
